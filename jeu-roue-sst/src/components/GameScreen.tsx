'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wheel } from './Wheel'
import { QuestionPanel } from './QuestionPanel'
import { TeamChip } from './TeamChip'
import { Podium } from './Podium'
import { OfflineBadge } from './OfflineBadge'
import { SOLO_KEY, buildSyncPayload, useSession } from '@/lib/game/session-store'
import { applyScale, toggleFullscreen, useKeyboard } from '@/lib/game/use-keyboard'
import { SETTLE_DURATION_MS, SPIN_DURATION_MS } from '@/lib/game/wheel'
import { onPendingChange, flushOutbox } from '@/lib/game/sync'
import { readOutbox } from '@/lib/game/persistence'

export function GameScreen() {
  const router = useRouter()
  const store = useSession()
  const [announce, setAnnounce] = useState('')
  const [pendingSync, setPendingSync] = useState(0)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    bank,
    teams,
    mode,
    phase,
    rotation,
    currentSnapshot,
    assignments,
    pinnedTeamIds,
    debateVerdicts,
    selectedTeamId,
    rounds,
    questionLimit,
    askedQuestionIds,
  } = store

  // --- Session absente : on ne bloque pas, on renvoie au setup -------------
  useEffect(() => {
    if (!store.clientSessionId) router.replace('/')
  }, [store.clientSessionId, router])

  useEffect(() => {
    void readOutbox().then((o) => setPendingSync(o.length))
    return onPendingChange(setPendingSync)
  }, [])

  useEffect(() => () => { if (spinTimer.current) clearTimeout(spinTimer.current) }, [])

  // --- Thèmes épuisés : la roue ne peut plus s'y arrêter, mais les
  //     participants doivent le voir ----------------------------------------
  const exhaustedThemeIds = useMemo(() => {
    const asked = new Set(askedQuestionIds)
    return bank.themes
      .filter((theme) => !bank.questions.some((q) => q.themeId === theme.id && !asked.has(q.id)))
      .map((theme) => theme.id)
  }, [bank, askedQuestionIds])

  // --- Actions ------------------------------------------------------------

  const handleSpin = useCallback(() => {
    if (store.phase !== 'idle') return

    const plan = store.startSpin()
    if (!plan) {
      // Banque épuisée avant la limite : on termine proprement en le disant.
      setAnnounce('Toutes les questions ont été posées. Fin de partie.')
      store.endGame()
      return
    }

    setAnnounce('La roue tourne…')
    spinTimer.current = setTimeout(() => {
      store.settleSpin()
      const theme = store.bank.themes.find((t) => t.id === store.currentThemeId)
      setAnnounce(`Thème tiré : ${theme?.label ?? ''}`)
    }, SPIN_DURATION_MS + SETTLE_DURATION_MS)
  }, [store])

  const handleAnswerByIndex = useCallback(
    (index: number) => {
      const option = store.currentSnapshot?.options[index]
      if (option) store.clickAnswer(option.id)
    },
    [store],
  )

  const handleValidate = useCallback(() => {
    if (store.phase !== 'question') return
    store.validate()
    setAnnounce('Réponses validées.')
  }, [store])

  const handleNext = useCallback(() => {
    if (store.phase !== 'reveal') return
    store.nextRound()
    setAnnounce('Question suivante : lancez la roue.')
  }, [store])

  const handleUndo = useCallback(() => {
    if (!store.canUndo()) return
    store.undo()
    setAnnounce('Dernière action annulée.')
  }, [store])

  useKeyboard({
    phase,
    onSpin: handleSpin,
    onAnswer: handleAnswerByIndex,
    onValidate: handleValidate,
    onNext: handleNext,
    onUndo: handleUndo,
    onEscape: () => setConfirmEnd(false),
    onFullscreen: toggleFullscreen,
    onScale: (delta) => applyScale(delta),
  })

  function exportJson() {
    const payload = buildSyncPayload({ ...store })
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = (store.endedAt ?? store.startedAt ?? '').slice(0, 10)
    link.href = url
    link.download = `session-sst-${store.clientName ?? 'sans-client'}-${stamp}.json`.replace(/\s+/g, '-')
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!store.clientSessionId) {
    return <main className="p-6">Redirection…</main>
  }

  if (phase === 'finished') {
    return (
      <>
        <OfflineBadge pendingSync={pendingSync} />
        <Podium
          state={{ ...store }}
          pendingSync={pendingSync}
          onExport={exportJson}
          onNewSession={() => {
            void flushOutbox()
            router.push('/')
          }}
        />
      </>
    )
  }

  const canValidate = phase === 'question'
  const progress = `${rounds.length} / ${questionLimit}`

  return (
    <main className="flex h-screen flex-col overflow-hidden p-3 lg:p-4">
      <OfflineBadge pendingSync={pendingSync} />

      {/* Annonces pour les lecteurs d'écran : thème tiré, validation, annulation. */}
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>

      {/* --- Barre du haut : scores et progression --------------------- */}
      <header className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {teams.map((team) => (
            <TeamChip
              key={team.id}
              as="span"
              name={team.name}
              colorKey={team.colorKey}
              score={team.score}
              className="pointer-events-none"
            />
          ))}
          {mode === 'solo' && (
            <span className="text-lg font-bold">
              Bonnes réponses&nbsp;:{' '}
              <span className="tabular">
                {rounds.flatMap((r) => r.answers).filter((a) => a.verdict === 'correct').length}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular font-bold text-[color:var(--brand-text-muted)]">
            Question {progress}
          </span>
          <button
            className="btn btn-secondary min-h-0 px-3 py-1.5 text-sm"
            onClick={handleUndo}
            disabled={!store.canUndo()}
            title="Annuler la dernière action (Retour arrière)"
          >
            ↶ Annuler
          </button>
          <button
            className="btn btn-danger min-h-0 px-3 py-1.5 text-sm"
            onClick={() => setConfirmEnd(true)}
          >
            Fin de partie
          </button>
        </div>
      </header>

      {/* --- Corps : roue à gauche, question à droite ------------------- */}
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
        <section className="flex min-h-0 items-center justify-center">
          <Wheel
            themes={bank.themes}
            rotation={rotation}
            spinning={phase === 'spinning'}
            exhaustedThemeIds={exhaustedThemeIds}
            selectedThemeId={store.currentThemeId}
            onClick={handleSpin}
            disabled={phase !== 'idle'}
          />
        </section>

        <section className="flex min-h-0 flex-col">
          {currentSnapshot && (phase === 'question' || phase === 'reveal') ? (
            <>
              <div className="min-h-0 flex-1">
                <QuestionPanel
                  snapshot={currentSnapshot}
                  teams={teams}
                  mode={mode}
                  assignments={assignments}
                  pinnedTeamIds={pinnedTeamIds}
                  debateVerdicts={debateVerdicts}
                  selectedTeamId={selectedTeamId}
                  revealed={phase === 'reveal'}
                  onSelectTeam={store.selectTeam}
                  onClickAnswer={store.clickAnswer}
                  onDebateVerdict={store.setDebateVerdict}
                />
              </div>

              <div className="mt-3 flex shrink-0 items-center gap-3">
                {canValidate ? (
                  <button className="btn btn-primary flex-1 text-lg" onClick={handleValidate}>
                    Valider les réponses <span className="opacity-70">(Entrée)</span>
                  </button>
                ) : (
                  <button className="btn btn-primary flex-1 text-lg" onClick={handleNext}>
                    {rounds.length >= questionLimit || store.isBankExhausted()
                      ? 'Voir les résultats'
                      : 'Question suivante'}{' '}
                    <span className="opacity-70">(Entrée)</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-[clamp(1.1rem,1.8vw,1.6rem)] font-bold">
                {phase === 'spinning' ? 'La roue tourne…' : 'Lancez la roue'}
              </p>
              {phase === 'idle' && (
                <>
                  <p className="max-w-md text-[color:var(--brand-text-muted)]">
                    Cliquez la roue ou appuyez sur <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-bold">Espace</kbd>.
                  </p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-sm text-[color:var(--brand-text-muted)]">
                    <dt className="font-bold">1 – 4</dt><dd>choisir une réponse</dd>
                    <dt className="font-bold">Entrée</dt><dd>valider / suivant</dd>
                    <dt className="font-bold">Retour arr.</dt><dd>annuler la dernière action</dd>
                    <dt className="font-bold">F</dt><dd>plein écran</dd>
                    <dt className="font-bold">+ / −</dt><dd>taille du texte</dd>
                    <dt className="font-bold">Page ↓ / ↑</dt><dd>télécommande de présentation</dd>
                  </dl>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* --- Confirmation de fin de partie ----------------------------- */}
      {confirmEnd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-end-title"
        >
          <div className="card max-w-md space-y-4 p-6">
            <h2 id="confirm-end-title" className="text-xl">
              Terminer la partie ?
            </h2>
            <p className="text-[color:var(--brand-text-muted)]">
              {rounds.length} question{rounds.length > 1 ? 's' : ''} posée{rounds.length > 1 ? 's' : ''}.
              Les résultats seront affichés et la séance enregistrée.
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-danger flex-1"
                onClick={() => {
                  setConfirmEnd(false)
                  store.endGame()
                }}
              >
                Terminer
              </button>
              <button className="btn btn-secondary flex-1" onClick={() => setConfirmEnd(false)}>
                Continuer la partie
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
