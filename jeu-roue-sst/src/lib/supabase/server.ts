import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Le type que `setAll` reçoit. Annoté explicitement : l'union des deux API de
 *  cookies de @supabase/ssr empêche l'inférence contextuelle. */
type CookieToSet = { name: string; value: string; options: CookieOptions }

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route
 * Handlers). Agit au nom de l'utilisateur connecté : RLS s'applique.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies y est
            // interdite. Sans conséquence, le middleware rafraîchit la session.
          }
        },
      },
    },
  )
}

/**
 * Client administrateur, qui CONTOURNE RLS.
 *
 * ⚠️  Réservé aux Route Handlers exécutés côté serveur, jamais importé depuis
 * un composant client. Utilisé uniquement par la synchro de fin de partie, qui
 * doit écrire dans plusieurs tables de façon atomique, et par le cron.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    cookies: { getAll: () => [], setAll: () => {} },
  })
}
