'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Connexion par email + mot de passe.
 *
 * Google OAuth est prévu en V2 : les 4 étapes de configuration chez Google
 * Cloud (écran de consentement) sont la seule partie du setup qui peut bloquer
 * longtemps, pour un bénéfice nul à 3 utilisateurs. Le bouton est déjà prêt
 * ci-dessous, il suffira de le décommenter une fois le fournisseur activé dans
 * Supabase > Authentication > Providers > Google.
 */
export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('suivant') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // On ne détaille pas la cause (compte inexistant vs mot de passe faux) :
      // ça éviterait de confirmer l'existence d'une adresse.
      setError('Adresse ou mot de passe incorrect.')
      setBusy(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <label htmlFor="email" className="mb-1 block font-semibold">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-semibold">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-[color:var(--brand-danger)]">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? 'Connexion…' : 'Se connecter'}
      </button>

      {/*
      V2 — décommenter après avoir activé Google dans Supabase :

      <button
        type="button"
        className="btn btn-secondary w-full"
        onClick={async () => {
          const supabase = createClient()
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?suivant=${next}` },
          })
        }}
      >
        Continuer avec Google
      </button>
      */}

      <p className="text-sm text-[color:var(--brand-text-muted)]">
        Les comptes sont créés par l’administrateur. Si vous n’arrivez pas à vous connecter,
        contactez-le.
      </p>
    </form>
  )
}
