/** Correction et barème — fonctions pures. */

import type { QuestionSnapshot, Verdict } from './types'

/**
 * Barème. Le cahier des charges est explicite : 1 point pour une bonne
 * réponse, 0 sinon. « Partiel » vaut donc 0 point, mais il est enregistré
 * distinctement car il porte une information précieuse dans les rapports
 * (« thème partiellement maîtrisé » ≠ « thème méconnu »).
 *
 * Un seul endroit à modifier si vous voulez créditer les réponses partielles.
 */
export const POINTS_BY_VERDICT: Readonly<Record<Verdict, number>> = {
  correct: 1,
  partial: 0,
  incorrect: 0,
  skipped: 0,
}

export function pointsFor(verdict: Verdict): number {
  return POINTS_BY_VERDICT[verdict]
}

/** Identifiants des bonnes réponses d'un snapshot. */
export function correctOptionIds(snapshot: QuestionSnapshot): string[] {
  return snapshot.options.filter((o) => o.isCorrect).map((o) => o.id)
}

/**
 * Corrige une sélection d'options.
 *
 * - mcq_single : juste si l'unique option cochée est la bonne.
 * - mcq_multi  : juste seulement si la sélection correspond EXACTEMENT à
 *                l'ensemble des bonnes réponses. Un sous-ensemble non vide et
 *                sans erreur donne « partiel » ; toute option fausse cochée
 *                donne « incorrect ».
 * - debate     : non corrigeable automatiquement, c'est l'animateur qui
 *                tranche → on renvoie 'skipped' pour signaler qu'il faut un
 *                verdict manuel.
 */
export function evaluateSelection(
  snapshot: QuestionSnapshot,
  selectedOptionIds: readonly string[],
): Verdict {
  if (snapshot.kind === 'debate') return 'skipped'
  if (selectedOptionIds.length === 0) return 'skipped'

  const correct = new Set(correctOptionIds(snapshot))
  const selected = new Set(selectedOptionIds)

  if (snapshot.kind === 'mcq_single') {
    const only = [...selected][0]
    return selected.size === 1 && only !== undefined && correct.has(only) ? 'correct' : 'incorrect'
  }

  const hasWrong = [...selected].some((id) => !correct.has(id))
  if (hasWrong) return 'incorrect'
  if (selected.size === correct.size) return 'correct'
  return 'partial'
}

export interface Standing {
  teamId: string
  name: string
  colorKey: string
  score: number
  /** 1 = premier. Les ex æquo partagent le même rang. */
  rank: number
}

/**
 * Classement final. Tri par score décroissant, puis par ordre de création
 * pour que l'affichage soit stable et reproductible.
 */
export function computeStandings(
  teams: readonly { id: string; name: string; colorKey: string; score: number; sortOrder: number }[],
): Standing[] {
  const sorted = [...teams].sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder)

  const standings: Standing[] = []
  let rank = 0
  let previousScore: number | null = null

  sorted.forEach((team, index) => {
    if (previousScore === null || team.score !== previousScore) {
      rank = index + 1
      previousScore = team.score
    }
    standings.push({
      teamId: team.id,
      name: team.name,
      colorKey: team.colorKey,
      score: team.score,
      rank,
    })
  })

  return standings
}
