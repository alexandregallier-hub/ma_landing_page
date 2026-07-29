import seed from '../../../content/questions-seed.json'
import type { Question, QuestionBank, QuestionKind, Theme } from './types'

/**
 * Banque construite directement depuis content/questions-seed.json, SANS base
 * de données.
 *
 * Deux usages :
 *   1. le mode démo public (/demo) — montrer le jeu à un prospect sans compte,
 *      sans Supabase, sans rien à configurer ;
 *   2. la recette : vérifier le jeu de bout en bout avant même d'avoir branché
 *      Supabase.
 *
 * Les identifiants sont dérivés de l'index, donc STABLES d'un chargement à
 * l'autre : indispensable pour que la reprise de session fonctionne aussi en
 * démo, et pour que les tests soient reproductibles.
 */

/** UUID déterministe valide, dérivé d'un préfixe et d'un index. */
function stableUuid(prefix: string, index: number): string {
  const hex = (prefix + '0'.repeat(12) + index.toString(16))
    .replace(/[^0-9a-f]/gi, '')
    .toLowerCase()
    .slice(-12)
    .padStart(12, '0')
  const head = index.toString(16).padStart(8, '0').slice(-8)
  return `${head}-0000-4000-8000-${hex}`
}

export const DEMO_ORG_ID = '00000000-0000-4000-8000-000000000000'

interface SeedTheme {
  key: string
  label: string
  short_label: string
  icon?: string
  description?: string
  sort_order: number
}

interface SeedQuestion {
  theme: string
  kind: QuestionKind
  statement: string
  explanation: string
  expected_answer?: string
  source_ref?: string
  difficulty?: number
  options?: { label: string; correct?: boolean }[]
}

export function buildDemoBank(): QuestionBank {
  const seedThemes = seed.themes as SeedTheme[]
  const seedQuestions = seed.questions as SeedQuestion[]

  const themes: Theme[] = seedThemes.map((theme, i) => ({
    id: stableUuid('a', i),
    key: theme.key,
    label: theme.label,
    shortLabel: theme.short_label ?? theme.label,
    description: theme.description ?? null,
    icon: theme.icon ?? null,
    sortOrder: theme.sort_order,
  }))

  const themeIdByKey = new Map(themes.map((t, i) => [seedThemes[i]!.key, t.id]))

  const questions: Question[] = seedQuestions.map((question, i) => ({
    id: stableUuid('b', i),
    themeId: themeIdByKey.get(question.theme)!,
    kind: question.kind,
    statement: question.statement,
    explanation: question.explanation,
    expectedAnswer: question.expected_answer ?? null,
    sourceRef: question.source_ref ?? null,
    difficulty: question.difficulty ?? null,
    options: (question.options ?? []).map((option, j) => ({
      id: stableUuid('c', i * 10 + j),
      label: option.label,
      isCorrect: option.correct === true,
      sortOrder: j,
    })),
  }))

  return { themes, questions }
}
