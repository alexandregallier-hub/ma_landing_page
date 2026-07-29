import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = { name: string; value: string; options: CookieOptions }

/**
 * Rafraîchit la session Supabase à chaque navigation et protège les routes.
 *
 * Sans ce middleware, le jeton d'accès expire au bout d'une heure et
 * l'animateur se retrouve déconnecté en pleine séance.
 */

// '/jouer' est public : la page ne lit AUCUNE donnée serveur, tout vient du
// store local. C'est ce qui permet au mode démo de fonctionner sans compte, et
// un visiteur non connecté y est de toute façon renvoyé vers l'accueil.
const PUBLIC_PATHS = ['/login', '/auth', '/api/cron', '/demo', '/jouer']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // getUser() et non getSession() : getUser valide le jeton auprès de Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // On mémorise la destination pour y revenir après connexion.
    url.searchParams.set('suivant', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques et les images.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
