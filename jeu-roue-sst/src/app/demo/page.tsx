import Link from 'next/link'
import { SetupForm } from '@/components/SetupForm'
import { DEMO_ORG_ID, buildDemoBank } from '@/lib/game/demo-bank'

export const metadata = { title: 'Démo — Roue de la prévention SST' }

/**
 * Mode démo public : sans compte, sans base de données.
 *
 * Sert à montrer le jeu à un prospect en lui envoyant simplement un lien, et à
 * recetter l'application avant même d'avoir branché Supabase. Rien n'est
 * enregistré : la partie ne remonte nulle part.
 */
export default function DemoPage() {
  const bank = buildDemoBank()

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <header className="mb-6">
        <p
          className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide"
          style={{ background: 'var(--brand-accent)', color: '#fff' }}
        >
          Mode démonstration
        </p>
        <h1 className="text-2xl">Roue de la prévention santé-sécurité</h1>
        <p className="mt-1 text-[color:var(--brand-text-muted)]">
          {bank.questions.length} questions sur {bank.themes.length} thèmes. Aucune donnée n’est
          enregistrée en mode démo.{' '}
          <Link href="/login" className="underline">
            Se connecter
          </Link>{' '}
          pour animer une vraie session.
        </p>
      </header>

      <SetupForm orgId={DEMO_ORG_ID} bank={bank} demo />
    </main>
  )
}
