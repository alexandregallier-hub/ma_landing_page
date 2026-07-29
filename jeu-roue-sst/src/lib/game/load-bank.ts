import { createClient } from '@/lib/supabase/server'
import type { Question, QuestionBank, QuestionKind, Theme } from './types'

/**
 * Précharge TOUTE la banque effective en une seule requête.
 *
 * Volume réel : 10 thèmes × 20 questions × ~500 octets ≈ 150 Ko. C'est un rien,
 * et c'est ce qui permet au jeu de ne plus toucher au réseau pendant la séance.
 * Le cold start Vercel (2-3 s après inactivité) se paierait sinon en plein
 * silence de salle, entre deux questions.
 *
 * La résolution « globale + surcharges » (héritage / fork / masquage) est faite
 * par la fonction SQL effective_questions(org_id).
 */
export async function loadBank(orgId: string): Promise<QuestionBank> {
  const supabase = await createClient()

  const [themesResult, questionsResult] = await Promise.all([
    supabase
      .from('themes')
      .select('id, key, label, short_label, description, icon, sort_order')
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.rpc('effective_questions', { target_org: orgId }),
  ])

  if (themesResult.error) throw new Error(`Chargement des thèmes : ${themesResult.error.message}`)
  if (questionsResult.error) throw new Error(`Chargement des questions : ${questionsResult.error.message}`)

  const themes: Theme[] = (themesResult.data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    label: row.label,
    // Repli sur le libellé complet si le court n'est pas renseigné.
    shortLabel: row.short_label ?? row.label,
    description: row.description,
    icon: row.icon,
    sortOrder: row.sort_order,
  }))

  type QuestionRow = {
    id: string
    theme_id: string
    kind: QuestionKind
    statement: string
    explanation: string
    expected_answer: string | null
    source_ref: string | null
    difficulty: number | null
  }

  const rows = (questionsResult.data ?? []) as QuestionRow[]

  // Les options en une requête, plutôt qu'une par question.
  const ids = rows.map((r) => r.id)
  const optionsByQuestion = new Map<string, Question['options']>()

  if (ids.length > 0) {
    const { data: options, error } = await supabase
      .from('question_options')
      .select('id, question_id, label, is_correct, sort_order')
      .in('question_id', ids)
      .order('sort_order', { ascending: true })

    if (error) throw new Error(`Chargement des options : ${error.message}`)

    for (const option of options ?? []) {
      const list = optionsByQuestion.get(option.question_id) ?? []
      list.push({
        id: option.id,
        label: option.label,
        isCorrect: option.is_correct,
        sortOrder: option.sort_order,
      })
      optionsByQuestion.set(option.question_id, list)
    }
  }

  const themeIds = new Set(themes.map((t) => t.id))

  const questions: Question[] = rows
    // Un thème désactivé ne doit pas laisser ses questions dans la banque,
    // sinon la roue pourrait pointer un secteur qui n'existe plus.
    .filter((row) => themeIds.has(row.theme_id))
    .map((row) => ({
      id: row.id,
      themeId: row.theme_id,
      kind: row.kind,
      statement: row.statement,
      explanation: row.explanation,
      expectedAnswer: row.expected_answer,
      sourceRef: row.source_ref,
      difficulty: row.difficulty,
      options: optionsByQuestion.get(row.id) ?? [],
    }))

  return {
    // On n'affiche pas un secteur vide : un thème sans question n'a rien à
    // faire sur la roue.
    themes: themes.filter((theme) => questions.some((q) => q.themeId === theme.id)),
    questions,
  }
}

/** Organisation de l'utilisateur connecté, avec son rôle. */
export async function loadMembership(): Promise<{
  userId: string
  email: string
  orgId: string
  orgName: string
  role: 'admin' | 'animator'
  isPlatformAdmin: boolean
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('memberships')
    .select('org_id, role, organizations(name), profiles(email, is_platform_admin)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const organization = data.organizations as unknown as { name: string } | null
  const profile = data.profiles as unknown as { email: string; is_platform_admin: boolean } | null

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? '',
    orgId: data.org_id,
    orgName: organization?.name ?? 'Mon organisation',
    role: data.role,
    isPlatformAdmin: profile?.is_platform_admin ?? false,
  }
}
