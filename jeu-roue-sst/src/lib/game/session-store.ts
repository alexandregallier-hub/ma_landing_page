/**
 * Store de la partie — local-first.
 *
 * Tout l'état du jeu vit ici, en mémoire, persisté dans IndexedDB à chaque
 * action. Aucune requête réseau n'est nécessaire entre deux questions : le
 * podium lui-même est calculé entièrement en local. C'est le moment le plus
 * visible de la séance, il ne doit pas pouvoir échouer.
 */

'use client'

import { create } from 'zustand'
import { evaluateSelection, pointsFor } from './scoring'
import { dropSnapshot, enqueue, saveSnapshot } from './persistence'
import { flushOutbox } from './sync'
import {
  buildCandidates,
  computeTargetAngle,
  pickQuestion,
  pickWeightedTheme,
  type SpinPlan,
} from './wheel'
import type {
  GamePhase,
  Question,
  QuestionBank,
  QuestionSnapshot,
  Round,
  RoundAnswer,
  SessionMode,
  Team,
  TeamColorKey,
  Verdict,
} from './types'

/** Clé d'assignation utilisée en mode sans équipe. */
export const SOLO_KEY = '__solo__'

/** Profondeur de l'historique d'annulation. Largement suffisant en séance. */
const UNDO_DEPTH = 40

export interface SessionConfig {
  orgId: string
  /** Partie de démonstration : rien n'est remonté au serveur. */
  demo?: boolean
  brandProfileId: string | null
  mode: SessionMode
  teamNames: string[]
  title: string | null
  clientName: string | null
  location: string | null
  audienceSize: number | null
  questionLimit: number
}

/** Partie sérialisable : c'est exactement ce qui part dans IndexedDB. */
export interface PersistedState {
  clientSessionId: string
  orgId: string
  demo: boolean
  brandProfileId: string | null
  title: string | null
  clientName: string | null
  location: string | null
  audienceSize: number | null
  mode: SessionMode
  questionLimit: number
  startedAt: string
  endedAt: string | null
  status: 'running' | 'finished'

  bank: QuestionBank
  teams: Team[]

  rotation: number
  phase: GamePhase
  currentThemeId: string | null
  currentQuestion: Question | null
  currentSnapshot: QuestionSnapshot | null

  /** teamId (ou SOLO_KEY) → identifiants des options choisies. */
  assignments: Record<string, string[]>
  /** Équipes déplacées à la main : un clic sur une réponse ne les bouge plus. */
  pinnedTeamIds: string[]
  /** Verdicts saisis par l'animateur pour les questions de type débat. */
  debateVerdicts: Record<string, Verdict>
  selectedTeamId: string | null

  askedQuestionIds: string[]
  themeDraws: Record<string, number>
  rounds: Round[]
}

interface Actions {
  initSession: (config: SessionConfig, bank: QuestionBank) => void
  hydrate: (state: PersistedState) => void

  /** Tire le thème et la question, PUIS calcule l'angle qui y mène. */
  startSpin: () => SpinPlan | null
  settleSpin: () => void

  selectTeam: (teamId: string | null) => void
  /**
   * Clic sur une carte-réponse.
   * - une équipe sélectionnée → seule cette équipe s'y place, et elle est épinglée
   * - aucune équipe sélectionnée → toutes les équipes non épinglées s'y placent
   */
  clickAnswer: (optionId: string) => void
  setDebateVerdict: (teamId: string, verdict: Verdict) => void

  validate: () => void
  nextRound: () => void
  endGame: () => void

  undo: () => void
  canUndo: () => boolean

  /** Nombre de questions encore disponibles dans toute la banque. */
  remainingQuestions: () => number
  isBankExhausted: () => boolean
}

export type SessionStore = PersistedState & Actions

/** Les 4 clés de couleur, attribuées dans l'ordre de création des équipes. */
const COLOR_ORDER: TeamColorKey[] = ['bleu', 'orange', 'vert', 'violet']

const PERSISTED_KEYS: (keyof PersistedState)[] = [
  'clientSessionId', 'orgId', 'demo', 'brandProfileId', 'title', 'clientName', 'location',
  'audienceSize', 'mode', 'questionLimit', 'startedAt', 'endedAt', 'status',
  'bank', 'teams', 'rotation', 'phase', 'currentThemeId', 'currentQuestion',
  'currentSnapshot', 'assignments', 'pinnedTeamIds', 'debateVerdicts',
  'selectedTeamId', 'askedQuestionIds', 'themeDraws', 'rounds',
]

function extractPersisted(state: SessionStore): PersistedState {
  const out = {} as Record<string, unknown>
  for (const key of PERSISTED_KEYS) out[key] = state[key]
  return out as unknown as PersistedState
}

const EMPTY_BANK: QuestionBank = { themes: [], questions: [] }

const INITIAL: PersistedState = {
  clientSessionId: '',
  orgId: '',
  demo: false,
  brandProfileId: null,
  title: null,
  clientName: null,
  location: null,
  audienceSize: null,
  mode: 'teams',
  questionLimit: 20,
  startedAt: '',
  endedAt: null,
  status: 'running',
  bank: EMPTY_BANK,
  teams: [],
  rotation: 0,
  phase: 'idle',
  currentThemeId: null,
  currentQuestion: null,
  currentSnapshot: null,
  assignments: {},
  pinnedTeamIds: [],
  debateVerdicts: {},
  selectedTeamId: null,
  askedQuestionIds: [],
  themeDraws: {},
  rounds: [],
}

/** Pile d'annulation, hors du store : elle n'a pas à être persistée ni observée. */
let undoStack: PersistedState[] = []

function pushUndo(state: SessionStore) {
  undoStack.push(structuredClone(extractPersisted(state)))
  if (undoStack.length > UNDO_DEPTH) undoStack.shift()
}

function makeSnapshot(bank: QuestionBank, question: Question, themeLabel: string): QuestionSnapshot {
  return {
    questionId: question.id,
    themeId: question.themeId,
    themeLabel,
    kind: question.kind,
    statement: question.statement,
    explanation: question.explanation,
    expectedAnswer: question.expectedAnswer,
    sourceRef: question.sourceRef,
    options: question.options
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
  }
}

export const useSession = create<SessionStore>()((set, get) => {
  /** Sauvegarde après chaque mutation. Volontairement non bloquant. */
  const persist = () => {
    const state = get()
    if (!state.clientSessionId) return
    void saveSnapshot(state.clientSessionId, extractPersisted(state))
  }

  return {
    ...INITIAL,

    initSession: (config, bank) => {
      undoStack = []
      const teams: Team[] =
        config.mode === 'teams'
          ? config.teamNames.slice(0, 4).map((name, i) => ({
              id: crypto.randomUUID(),
              name: name.trim() || `Équipe ${i + 1}`,
              colorKey: COLOR_ORDER[i]!,
              sortOrder: i,
              score: 0,
            }))
          : []

      set({
        ...INITIAL,
        clientSessionId: crypto.randomUUID(),
        orgId: config.orgId,
        demo: config.demo === true,
        brandProfileId: config.brandProfileId,
        title: config.title,
        clientName: config.clientName,
        location: config.location,
        audienceSize: config.audienceSize,
        mode: config.mode,
        questionLimit: config.questionLimit,
        startedAt: new Date().toISOString(),
        bank,
        teams,
      })
      persist()
    },

    hydrate: (state) => {
      undoStack = []
      // Une partie reprise après un crash pendant l'animation doit repartir
      // d'un état stable, sinon la roue reste bloquée en 'spinning'.
      set({ ...state, phase: state.phase === 'spinning' ? 'idle' : state.phase })
    },

    startSpin: () => {
      const state = get()
      if (state.phase !== 'idle') return null

      const candidates = buildCandidates(state.bank, state.askedQuestionIds, state.themeDraws)
      const previousThemeId = state.rounds.at(-1)?.themeId ?? null
      const themeId = pickWeightedTheme(candidates, previousThemeId)
      if (!themeId) return null

      const question = pickQuestion(state.bank, themeId, state.askedQuestionIds)
      if (!question) return null

      const themeIndex = state.bank.themes.findIndex((t) => t.id === themeId)
      if (themeIndex < 0) return null
      const themeLabel = state.bank.themes[themeIndex]!.label

      const plan = computeTargetAngle(state.rotation, themeIndex, state.bank.themes.length)

      pushUndo(state)
      set({
        phase: 'spinning',
        rotation: plan.targetRotation,
        currentThemeId: themeId,
        currentQuestion: question,
        currentSnapshot: makeSnapshot(state.bank, question, themeLabel),
        assignments: {},
        pinnedTeamIds: [],
        debateVerdicts: {},
        selectedTeamId: null,
      })
      persist()
      return plan
    },

    settleSpin: () => {
      if (get().phase !== 'spinning') return
      set({ phase: 'question' })
      persist()
    },

    selectTeam: (teamId) => {
      const current = get().selectedTeamId
      set({ selectedTeamId: current === teamId ? null : teamId })
    },

    clickAnswer: (optionId) => {
      const state = get()
      if (state.phase !== 'question' || !state.currentSnapshot) return
      const isMulti = state.currentSnapshot.kind === 'mcq_multi'

      const apply = (previous: string[] | undefined): string[] => {
        const list = previous ?? []
        if (!isMulti) return [optionId]
        return list.includes(optionId) ? list.filter((id) => id !== optionId) : [...list, optionId]
      }

      pushUndo(state)

      if (state.mode === 'solo') {
        set({ assignments: { ...state.assignments, [SOLO_KEY]: apply(state.assignments[SOLO_KEY]) } })
        persist()
        return
      }

      if (state.selectedTeamId) {
        // Placement fin : une équipe précise, qui devient épinglée pour qu'un
        // clic ultérieur sur une autre réponse ne la déplace plus.
        const teamId = state.selectedTeamId
        set({
          assignments: { ...state.assignments, [teamId]: apply(state.assignments[teamId]) },
          pinnedTeamIds: state.pinnedTeamIds.includes(teamId)
            ? state.pinnedTeamIds
            : [...state.pinnedTeamIds, teamId],
          selectedTeamId: null,
        })
        persist()
        return
      }

      // Comportement par défaut : toutes les équipes non épinglées s'y placent.
      const assignments = { ...state.assignments }
      for (const team of state.teams) {
        if (state.pinnedTeamIds.includes(team.id)) continue
        assignments[team.id] = apply(assignments[team.id])
      }
      set({ assignments })
      persist()
    },

    setDebateVerdict: (teamId, verdict) => {
      const state = get()
      if (state.phase !== 'question') return
      pushUndo(state)
      set({ debateVerdicts: { ...state.debateVerdicts, [teamId]: verdict }, selectedTeamId: null })
      persist()
    },

    validate: () => {
      const state = get()
      if (state.phase !== 'question' || !state.currentSnapshot || !state.currentThemeId) return
      const snapshot = state.currentSnapshot
      const isDebate = snapshot.kind === 'debate'

      const answers: RoundAnswer[] = []

      if (state.mode === 'solo') {
        const selected = state.assignments[SOLO_KEY] ?? []
        const verdict: Verdict = isDebate
          ? (state.debateVerdicts[SOLO_KEY] ?? 'skipped')
          : evaluateSelection(snapshot, selected)
        answers.push({
          teamId: null,
          selectedOptionIds: selected,
          openAnswer: null,
          verdict,
          points: pointsFor(verdict),
        })
      } else {
        for (const team of state.teams) {
          const selected = state.assignments[team.id] ?? []
          const verdict: Verdict = isDebate
            ? (state.debateVerdicts[team.id] ?? 'skipped')
            : evaluateSelection(snapshot, selected)
          answers.push({
            teamId: team.id,
            selectedOptionIds: selected,
            openAnswer: null,
            verdict,
            points: pointsFor(verdict),
          })
        }
      }

      const pointsByTeam = new Map(answers.filter((a) => a.teamId).map((a) => [a.teamId!, a.points]))
      const now = new Date().toISOString()

      const round: Round = {
        roundNo: state.rounds.length + 1,
        themeId: state.currentThemeId,
        snapshot,
        askedAt: now,
        validatedAt: now,
        answers,
      }

      pushUndo(state)
      set({
        phase: 'reveal',
        rounds: [...state.rounds, round],
        askedQuestionIds: [...state.askedQuestionIds, snapshot.questionId],
        themeDraws: {
          ...state.themeDraws,
          [state.currentThemeId]: (state.themeDraws[state.currentThemeId] ?? 0) + 1,
        },
        teams: state.teams.map((t) => ({ ...t, score: t.score + (pointsByTeam.get(t.id) ?? 0) })),
        selectedTeamId: null,
      })
      persist()
    },

    nextRound: () => {
      const state = get()
      if (state.phase !== 'reveal') return

      const reachedLimit = state.rounds.length >= state.questionLimit
      const exhausted = get().isBankExhausted()

      if (reachedLimit || exhausted) {
        get().endGame()
        return
      }

      pushUndo(state)
      set({
        phase: 'idle',
        currentThemeId: null,
        currentQuestion: null,
        currentSnapshot: null,
        assignments: {},
        pinnedTeamIds: [],
        debateVerdicts: {},
        selectedTeamId: null,
      })
      persist()
    },

    endGame: () => {
      const state = get()
      if (state.status === 'finished') return
      const endedAt = new Date().toISOString()

      pushUndo(state)
      set({ phase: 'finished', status: 'finished', endedAt, selectedTeamId: null })

      const finished = extractPersisted(get())
      void saveSnapshot(finished.clientSessionId, finished)

      // Une partie de démonstration ne remonte rien : inutile d'encombrer la
      // file d'attente avec un envoi qui serait de toute façon rejeté.
      if (finished.demo) return

      // Mise en file du récapitulatif complet : un seul POST, idempotent côté
      // serveur grâce à clientSessionId.
      void enqueue({
        clientEventId: `session-final:${finished.clientSessionId}`,
        clientSessionId: finished.clientSessionId,
        payload: buildSyncPayload(finished),
        queuedAt: endedAt,
        attempts: 0,
      }).then(() => flushOutbox())
    },

    undo: () => {
      const previous = undoStack.pop()
      if (!previous) return
      set(previous)
      void saveSnapshot(previous.clientSessionId, previous)
    },

    canUndo: () => undoStack.length > 0,

    remainingQuestions: () => {
      const state = get()
      const asked = new Set(state.askedQuestionIds)
      return state.bank.questions.filter((q) => !asked.has(q.id)).length
    },

    isBankExhausted: () => get().remainingQuestions() === 0,
  }
})

/** Récapitulatif envoyé au serveur en fin de partie. */
export function buildSyncPayload(state: PersistedState) {
  return {
    clientSessionId: state.clientSessionId,
    orgId: state.orgId,
    brandProfileId: state.brandProfileId,
    title: state.title,
    clientName: state.clientName,
    location: state.location,
    audienceSize: state.audienceSize,
    mode: state.mode,
    questionLimit: state.questionLimit,
    startedAt: state.startedAt,
    endedAt: state.endedAt,
    teams: state.teams.map((t) => ({
      name: t.name,
      colorKey: t.colorKey,
      sortOrder: t.sortOrder,
      score: t.score,
    })),
    rounds: state.rounds.map((r) => ({
      roundNo: r.roundNo,
      themeId: r.themeId,
      questionId: r.snapshot.questionId,
      snapshot: r.snapshot,
      askedAt: r.askedAt,
      validatedAt: r.validatedAt,
      answers: r.answers.map((a) => ({
        teamSortOrder:
          a.teamId === null ? null : (state.teams.find((t) => t.id === a.teamId)?.sortOrder ?? null),
        selectedOptionIds: a.selectedOptionIds,
        openAnswer: a.openAnswer,
        verdict: a.verdict,
        points: a.points,
      })),
    })),
  }
}

/** Efface la partie courante du stockage local (après synchro réussie, ou reset). */
export async function forgetSession(clientSessionId: string): Promise<void> {
  await dropSnapshot(clientSessionId)
}
