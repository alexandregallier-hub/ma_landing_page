import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Échange le code OAuth contre une session.
 *
 * Inutile en V1 (email + mot de passe uniquement), mais en place dès maintenant :
 * activer Google en V2 ne demandera que la configuration côté Supabase et
 * Google Cloud, sans toucher au code.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('suivant') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?erreur=auth`)
}
