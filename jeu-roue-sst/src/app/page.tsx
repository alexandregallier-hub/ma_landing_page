import { redirect } from 'next/navigation'
import { loadBank, loadMembership } from '@/lib/game/load-bank'
import { SetupForm } from '@/components/SetupForm'

export const metadata = { title: 'Nouvelle session — Roue de la prévention SST' }

/**
 * Page d'accueil = préparation de session.
 *
 * C'est aussi le seul moment où l'on a besoin du réseau avant la séance : on
 * précharge ici la banque entière, et le jeu n'y touchera plus.
 */
export default async function HomePage() {
  const membership = await loadMembership()

  if (!membership) {
    // Connecté (le middleware l'a vérifié) mais rattaché à aucune organisation :
    // l'amorçage n'a pas été fait.
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="card max-w-xl space-y-3 p-8">
          <h1 className="text-xl">Compte non rattaché</h1>
          <p>
            Votre compte n’est associé à aucune organisation. Exécutez{' '}
            <code className="rounded bg-black/5 px-1">supabase/bootstrap.sql</code> dans l’éditeur SQL
            de Supabase après y avoir mis votre adresse e-mail.
          </p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-secondary">Se déconnecter</button>
          </form>
        </div>
      </main>
    )
  }

  const bank = await loadBank(membership.orgId)

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-6">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl">Nouvelle session</h1>
          <p className="text-[color:var(--brand-text-muted)]">{membership.orgName}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-ghost min-h-0 px-2 py-1 text-sm">
            {membership.email} — quitter
          </button>
        </form>
      </header>

      {bank.themes.length === 0 ? (
        <div className="card space-y-3 p-8">
          <h2 className="text-lg">Banque de questions vide</h2>
          <p>
            Aucun thème ne contient de question active. Exécutez{' '}
            <code className="rounded bg-black/5 px-1">supabase/seed.sql</code> dans l’éditeur SQL de
            Supabase pour charger les 10 thèmes et 80 questions du catalogue.
          </p>
        </div>
      ) : (
        <SetupForm orgId={membership.orgId} bank={bank} />
      )}
    </main>
  )
}
