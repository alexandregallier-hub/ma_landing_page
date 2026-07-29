import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Déconnexion. En POST uniquement, pour qu'un lien ou un préchargement de
 *  navigateur ne puisse pas déconnecter l'animateur en pleine séance. */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url))
}
