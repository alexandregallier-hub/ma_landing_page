/** Types partagés du jeu. Miroir applicatif du schéma SQL. */

export type QuestionKind = 'mcq_single' | 'mcq_multi' | 'debate'
export type SessionMode = 'teams' | 'solo'
export type Verdict = 'correct' | 'partial' | 'incorrect' | 'skipped'

/** Clés symboliques des couleurs d'équipe. Jamais un hex : la palette est un
 *  contrat de lisibilité de l'application, pas une donnée saisie. */
export const TEAM_COLOR_KEYS = ['bleu', 'orange', 'vert', 'violet'] as const
export type TeamColorKey = (typeof TEAM_COLOR_KEYS)[number]

export interface Theme {
  id: string
  key: string
  label: string
  /** Libellé court affiché dans le secteur de la roue. */
  shortLabel: string
  description: string | null
  icon: string | null
  sortOrder: number
}

export interface QuestionOption {
  id: string
  label: string
  isCorrect: boolean
  sortOrder: number
}

export interface Question {
  id: string
  themeId: string
  kind: QuestionKind
  statement: string
  explanation: string
  expectedAnswer: string | null
  sourceRef: string | null
  difficulty: number | null
  options: QuestionOption[]
}

/** Banque préchargée en une requête au démarrage de session. Une fois en
 *  mémoire, le jeu n'a plus besoin du réseau. */
export interface QuestionBank {
  themes: Theme[]
  questions: Question[]
}

export interface Team {
  id: string
  name: string
  colorKey: TeamColorKey
  sortOrder: number
  score: number
}

/**
 * Copie figée de la question au moment où elle est posée.
 * Sans ce snapshot, éditer une question fausserait rétroactivement tous les
 * rapports déjà produits.
 */
export interface QuestionSnapshot {
  questionId: string
  themeId: string
  themeLabel: string
  kind: QuestionKind
  statement: string
  explanation: string
  expectedAnswer: string | null
  sourceRef: string | null
  options: { id: string; label: string; isCorrect: boolean }[]
}

/** Réponse d'une équipe (ou de la salle en mode solo : teamId = null). */
export interface RoundAnswer {
  teamId: string | null
  selectedOptionIds: string[]
  openAnswer: string | null
  verdict: Verdict
  points: number
}

export interface Round {
  roundNo: number
  themeId: string
  snapshot: QuestionSnapshot
  askedAt: string
  validatedAt: string | null
  answers: RoundAnswer[]
}

export type GamePhase =
  /** Prêt à tourner la roue. */
  | 'idle'
  /** Animation en cours : toute interaction est verrouillée. */
  | 'spinning'
  /** Question affichée, l'animateur place les équipes. */
  | 'question'
  /** Réponses validées, correction et commentaire affichés. */
  | 'reveal'
  /** Partie terminée, podium affiché. */
  | 'finished'
