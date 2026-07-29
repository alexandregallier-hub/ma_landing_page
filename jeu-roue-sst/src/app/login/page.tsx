import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Connexion — Roue de la prévention SST' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl" aria-hidden>
            🎯
          </div>
          <h1 className="text-2xl">Roue de la prévention</h1>
          <p className="mt-1 text-[color:var(--brand-text-muted)]">Santé & sécurité au travail</p>
        </div>

        <Suspense fallback={<div className="card p-6">Chargement…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
