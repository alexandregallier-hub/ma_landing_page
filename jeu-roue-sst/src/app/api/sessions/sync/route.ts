import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Remontée du récapitulatif de fin de partie.
 *
 * IDEMPOTENT : `game_sessions.client_session_id` est unique, et le navigateur le
 * génère avant tout accès réseau. Renvoyer deux fois le même récapitulatif est
 * donc sans conséquence — c'est ce qui rend la synchro différée sûre, y compris
 * après une coupure au milieu de l'envoi.
 */

const answerSchema = z.object({
  teamSortOrder: z.number().int().min(0).max(3).nullable(),
  selectedOptionIds: z.array(z.string().uuid()).max(20),
  openAnswer: z.string().max(4000).nullable(),
  verdict: z.enum(['correct', 'partial', 'incorrect', 'skipped']),
  points: z.number().int().min(0).max(10),
})

const roundSchema = z.object({
  roundNo: z.number().int().positive().max(500),
  themeId: z.string().uuid(),
  questionId: z.string().uuid(),
  // Le snapshot est volontairement stocké tel quel : c'est une copie figée de
  // la question, il ne doit pas être normalisé ni « corrigé ».
  snapshot: z.record(z.unknown()),
  askedAt: z.string().datetime(),
  validatedAt: z.string().datetime().nullable(),
  answers: z.array(answerSchema).max(5),
})

const payloadSchema = z.object({
  clientSessionId: z.string().uuid(),
  orgId: z.string().uuid(),
  brandProfileId: z.string().uuid().nullable(),
  title: z.string().max(200).nullable(),
  clientName: z.string().max(200).nullable(),
  location: z.string().max(200).nullable(),
  audienceSize: z.number().int().min(0).max(5000).nullable(),
  mode: z.enum(['teams', 'solo']),
  questionLimit: z.number().int().min(1).max(200),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  teams: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        colorKey: z.enum(['bleu', 'orange', 'vert', 'violet']),
        sortOrder: z.number().int().min(0).max(3),
        score: z.number().int().min(0).max(500),
      }),
    )
    .max(4),
  rounds: z.array(roundSchema).max(500),
})

export async function POST(request: NextRequest) {
  // 1. Authentification et autorisation avec le client UTILISATEUR (RLS active).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let payload: z.infer<typeof payloadSchema>
  try {
    payload = payloadSchema.parse(await request.json())
  } catch (error) {
    // 400 : le client considère ce rejet comme définitif et vide la file, sinon
    // un payload invalide bloquerait toutes les synchros suivantes.
    return NextResponse.json(
      { error: 'Récapitulatif invalide', details: String(error).slice(0, 500) },
      { status: 400 },
    )
  }

  // On vérifie que l'utilisateur appartient bien à l'organisation revendiquée :
  // sans ce contrôle, un utilisateur pourrait écrire dans une autre organisation
  // puisque l'insertion se fait ensuite avec la clé service_role.
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('org_id', payload.orgId)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'Organisation non autorisée' }, { status: 403 })
  }

  // 2. Écriture avec le client ADMIN : plusieurs tables liées à insérer, et le
  //    client a déjà été autorisé ci-dessus.
  const admin = createAdminClient()

  // Déjà remontée ? On sort en succès : c'est le cœur de l'idempotence.
  const { data: existing } = await admin
    .from('game_sessions')
    .select('id')
    .eq('client_session_id', payload.clientSessionId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ ok: true, sessionId: existing.id, duplicate: true })
  }

  const { data: session, error: sessionError } = await admin
    .from('game_sessions')
    .insert({
      org_id: payload.orgId,
      facilitator_id: user.id,
      brand_profile_id: payload.brandProfileId,
      title: payload.title,
      client_name: payload.clientName,
      location: payload.location,
      audience_size: payload.audienceSize,
      mode: payload.mode,
      team_count: payload.teams.length,
      question_limit: payload.questionLimit,
      status: 'finished',
      started_at: payload.startedAt,
      ended_at: payload.endedAt,
      client_session_id: payload.clientSessionId,
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    // Course entre deux flushs simultanés : l'autre a gagné, tout va bien.
    if (sessionError?.code === '23505') {
      return NextResponse.json({ ok: true, duplicate: true })
    }
    console.error('[sync] insertion de la session', sessionError)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }

  // --- Équipes ---
  const teamIdBySortOrder = new Map<number, string>()

  if (payload.teams.length > 0) {
    const { data: teams, error } = await admin
      .from('teams')
      .insert(
        payload.teams.map((team) => ({
          session_id: session.id,
          name: team.name,
          color_key: team.colorKey,
          sort_order: team.sortOrder,
          score: team.score,
        })),
      )
      .select('id, sort_order')

    if (error) {
      console.error('[sync] insertion des équipes', error)
      return NextResponse.json({ error: 'Enregistrement des équipes impossible' }, { status: 500 })
    }
    for (const team of teams ?? []) teamIdBySortOrder.set(team.sort_order, team.id)
  }

  // --- Tours ---
  if (payload.rounds.length > 0) {
    const { data: rounds, error } = await admin
      .from('session_rounds')
      .insert(
        payload.rounds.map((round) => ({
          session_id: session.id,
          round_no: round.roundNo,
          theme_id: round.themeId,
          question_id: round.questionId,
          question_snapshot: round.snapshot,
          asked_at: round.askedAt,
          validated_at: round.validatedAt,
        })),
      )
      .select('id, round_no')

    if (error) {
      console.error('[sync] insertion des tours', error)
      return NextResponse.json({ error: 'Enregistrement des tours impossible' }, { status: 500 })
    }

    const roundIdByNo = new Map((rounds ?? []).map((r) => [r.round_no, r.id]))

    const answers = payload.rounds.flatMap((round) => {
      const roundId = roundIdByNo.get(round.roundNo)
      if (!roundId) return []
      return round.answers.map((answer) => ({
        round_id: roundId,
        team_id: answer.teamSortOrder === null ? null : (teamIdBySortOrder.get(answer.teamSortOrder) ?? null),
        selected_option_ids: answer.selectedOptionIds,
        open_answer: answer.openAnswer,
        verdict: answer.verdict,
        points: answer.points,
      }))
    })

    if (answers.length > 0) {
      const { error: answersError } = await admin.from('round_answers').insert(answers)
      if (answersError) {
        console.error('[sync] insertion des réponses', answersError)
        return NextResponse.json({ error: 'Enregistrement des réponses impossible' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true, sessionId: session.id })
}
