/**
 * Mécanique de la roue — fonctions PURES, testées dans wheel.test.ts.
 *
 * ===========================================================================
 * PRINCIPE FONDAMENTAL : la roue est un théâtre, pas un générateur d'aléa.
 *
 * Le thème est tiré AVANT l'animation, en code, puis on calcule l'angle qui y
 * mène. Jamais l'inverse. Conséquences, toutes désirables :
 *   - la roue ne PEUT PAS tomber sur un thème épuisé ;
 *   - on évite le même thème deux fois de suite ;
 *   - on équilibre la couverture des thèmes sur la séance, ce qui est
 *     l'objectif pédagogique réel : balayer les 10 risques, pas faire trois
 *     fois « EPI ».
 * ===========================================================================
 *
 * Repère géométrique : les secteurs sont dessinés dans le sens horaire à
 * partir de midi. Le secteur i occupe donc [i·pas, (i+1)·pas) quand la roue
 * est à la rotation 0, et la flèche fixe pointe midi (0°).
 */

import type { Question, QuestionBank } from './types'

/** Durée de l'animation principale, en millisecondes. */
export const SPIN_DURATION_MS = 4500

/**
 * Accélération quasi instantanée puis très longue décélération : c'est la
 * signature perceptive d'un volant d'inertie. Une courbe plus symétrique
 * (ease-out classique) donne l'impression d'un moteur, pas d'une roue lancée.
 */
export const SPIN_EASING = 'cubic-bezier(0.12, 0, 0.16, 1)'

/** Amplitude et durée du « cliquet » final qui simule le taquet. */
export const SETTLE_DEGREES = 1.5
export const SETTLE_DURATION_MS = 220

/** Animation réduite pour prefers-reduced-motion. */
export const REDUCED_SPIN_DURATION_MS = 300

/** Modulo toujours positif (le `%` de JavaScript garde le signe du dividende). */
export function mod(value: number, m: number): number {
  return ((value % m) + m) % m
}

/** Angle d'ouverture d'un secteur, en degrés. */
export function sectorSize(count: number): number {
  return 360 / count
}

/**
 * Secteur actuellement désigné par la flèche fixe, pour une rotation donnée.
 * C'est l'inverse de computeTargetAngle() — sert aux tests et au débogage,
 * JAMAIS à déterminer le thème (cf. principe fondamental en tête de fichier).
 */
export function sectorAtPointer(rotation: number, count: number): number {
  const size = sectorSize(count)
  // Une rotation de +R degrés amène le secteur situé à l'angle -R sous la flèche.
  return Math.floor(mod(-rotation, 360) / size)
}

export interface SpinPlan {
  /** Rotation absolue à atteindre (cumulée, jamais remise à zéro). */
  targetRotation: number
  /** Index du secteur qui sera désigné. */
  sectorIndex: number
  durationMs: number
  easing: string
}

/**
 * Calcule la rotation absolue à atteindre pour que le secteur `sectorIndex`
 * s'arrête sous la flèche.
 *
 * On ACCUMULE la rotation et on ne la remet jamais à zéro en cours de partie :
 * repasser à 0 provoquerait un saut visuel. La normalisation se fait à l'arrêt
 * complet, transition désactivée (voir useWheel dans le composant).
 *
 * @param currentRotation rotation absolue actuelle, en degrés
 * @param sectorIndex     secteur visé, déjà choisi par pickWeightedTheme()
 * @param count           nombre de secteurs
 * @param rng             injectable pour les tests
 */
export function computeTargetAngle(
  currentRotation: number,
  sectorIndex: number,
  count: number,
  rng: () => number = Math.random,
): SpinPlan {
  const size = sectorSize(count)

  // Décalage à l'intérieur du secteur : le centre, plus un écart aléatoire.
  // ±0.35·pas garde la marge : l'arrêt tombe dans [0.15·pas, 0.85·pas], donc
  // jamais sur une frontière — et jamais pile au milieu, ce qui ferait
  // « mécanique » à l'œil.
  const jitter = (rng() * 2 - 1) * 0.35 * size
  const offsetInSector = size / 2 + jitter

  // Rotation (mod 360) qui amène ce point sous la flèche.
  const desired = mod(-(sectorIndex * size + offsetInSector), 360)

  // 4 à 6 tours complets pour que la rotation soit spectaculaire et que le
  // résultat reste imprévisible à l'œil.
  const turns = 4 + Math.floor(rng() * 3)

  const delta = mod(desired - currentRotation, 360) + 360 * turns

  return {
    targetRotation: currentRotation + delta,
    sectorIndex,
    durationMs: SPIN_DURATION_MS,
    easing: SPIN_EASING,
  }
}

export interface ThemeCandidate {
  themeId: string
  /** Nombre de questions encore jamais posées dans cette session. */
  remaining: number
  /** Nombre de fois où ce thème a déjà été tiré dans cette session. */
  draws: number
}

/**
 * Tire un thème en pondérant pour équilibrer la couverture.
 *
 *   poids = 0                    si le thème est épuisé
 *         = 0                    si c'est le thème précédent (sauf s'il ne
 *                                  reste que lui : sinon on bloquerait la partie)
 *         = 1 / (1 + tirages)    sinon
 *
 * @returns l'identifiant du thème, ou null si toute la banque est épuisée.
 */
export function pickWeightedTheme(
  candidates: ThemeCandidate[],
  previousThemeId: string | null,
  rng: () => number = Math.random,
): string | null {
  const available = candidates.filter((c) => c.remaining > 0)
  if (available.length === 0) return null

  // On écarte le thème précédent, sauf s'il est le dernier disponible.
  let pool = available.filter((c) => c.themeId !== previousThemeId)
  if (pool.length === 0) pool = available

  const weights = pool.map((c) => 1 / (1 + c.draws))
  const total = weights.reduce((a, b) => a + b, 0)

  let ticket = rng() * total
  for (let i = 0; i < pool.length; i++) {
    ticket -= weights[i]!
    if (ticket <= 0) return pool[i]!.themeId
  }
  // Filet contre les imprécisions de flottants.
  return pool[pool.length - 1]!.themeId
}

/**
 * Construit les candidats à partir de la banque et des questions déjà posées.
 * L'ordre suit celui des thèmes de la banque, donc celui des secteurs dessinés.
 */
export function buildCandidates(
  bank: QuestionBank,
  askedQuestionIds: Set<string> | readonly string[],
  themeDraws: Readonly<Record<string, number>>,
): ThemeCandidate[] {
  const asked = askedQuestionIds instanceof Set ? askedQuestionIds : new Set(askedQuestionIds)
  return bank.themes.map((theme) => ({
    themeId: theme.id,
    remaining: bank.questions.filter((q) => q.themeId === theme.id && !asked.has(q.id)).length,
    draws: themeDraws[theme.id] ?? 0,
  }))
}

/**
 * Choisit une question non encore posée dans le thème donné.
 * @returns la question, ou null si le thème est épuisé.
 */
export function pickQuestion(
  bank: QuestionBank,
  themeId: string,
  askedQuestionIds: Set<string> | readonly string[],
  rng: () => number = Math.random,
): Question | null {
  const asked = askedQuestionIds instanceof Set ? askedQuestionIds : new Set(askedQuestionIds)
  const pool = bank.questions.filter((q) => q.themeId === themeId && !asked.has(q.id))
  if (pool.length === 0) return null
  return pool[Math.floor(rng() * pool.length)] ?? null
}
