import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * ANTI-MISE-EN-VEILLE DE SUPABASE — le risque n°1 du projet.
 *
 * Le plan gratuit Supabase met le projet en PAUSE après environ 7 jours
 * d'inactivité. Avec un usage « une session par mois », l'application serait
 * morte le matin de l'animation, devant le client. Ce cron quotidien fait une
 * requête minimale pour maintenir le projet éveillé.
 *
 * Déclaré dans vercel.json (tous les jours à 6h UTC). Vercel envoie
 * automatiquement `Authorization: Bearer $CRON_SECRET`.
 *
 * Si vous passez au plan Supabase Pro, ce cron devient inutile — mais il ne
 * coûte rien, autant le laisser.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  // Si CRON_SECRET est défini, on l'exige : sans ça, n'importe qui pourrait
  // marteler l'endpoint. S'il n'est pas défini, on laisse passer pour ne pas
  // casser un déploiement où la variable a été oubliée.
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('organizations').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch (error) {
    console.error('[cron] keepalive', error)
    return NextResponse.json({ ok: false, error: String(error).slice(0, 200) }, { status: 500 })
  }
}
