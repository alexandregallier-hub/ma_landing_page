'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase côté navigateur.
 *
 * N'utilise que la clé anon, qui est publique par conception : c'est RLS qui
 * protège les données. La clé service_role ne doit JAMAIS apparaître ici —
 * `npm run check:secrets` vérifie qu'elle n'a pas fuité dans le bundle.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
