'use client'

import { useEffect, useMemo, useState } from 'react'
import { teamColor } from '@/lib/branding/teams'
import { computeStandings } from '@/lib/game/scoring'
import type { PersistedState } from '@/lib/game/session-store'
import { TeamChip } from './TeamChip'

interface Props {
  state: PersistedState
  pendingSync: number
  onExport: () => void
  onNewSession: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Écran de résultats.
 *
 * Calculé ENTIÈREMENT en local, sans aucun appel réseau : c'est le moment le
 * plus visible de la séance, il ne doit pas pouvoir échouer. Si la synchro n'est
 * pas passée, un badge discret le signale — jamais un blocage.
 */
export function Podium({ state, pendingSync, onExport, onNewSession }: Props) {
  const standings = useMemo(
    () =>
      computeStandings(
        state.teams.map((t) => ({
          id: t.id,
          name: t.name,
          colorKey: t.colorKey,
          score: t.score,
          sortOrder: t.sortOrder,
        })),
      ),
    [state.teams],
  )

  // Les barres partent de zéro et montent : l'animation se déclenche au montage.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 120)
    return () => clearTimeout(timer)
  }, [])

  const maxScore = Math.max(1, ...standings.map((s) => s.score))
  const totalAnswers = state.rounds.flatMap((r) => r.answers)
  const correctCount = totalAnswers.filter((a) => a.verdict === 'correct').length
  const answeredCount = totalAnswers.filter((a) => a.verdict !== 'skipped').length

  // Thèmes triés par taux de réussite : c'est l'amorce du rapport direction.
  // Le taux se calcule sur les réponses effectivement données (une par équipe
  // et par question), en excluant les non-réponses pour ne pas les compter
  // comme des erreurs.
  const themeStats = useMemo(() => {
    const map = new Map<string, { label: string; asked: number; answered: number; correct: number }>()

    for (const round of state.rounds) {
      const entry =
        map.get(round.themeId) ?? { label: round.snapshot.themeLabel, asked: 0, answered: 0, correct: 0 }
      entry.asked += 1
      entry.answered += round.answers.filter((a) => a.verdict !== 'skipped').length
      entry.correct += round.answers.filter((a) => a.verdict === 'correct').length
      map.set(round.themeId, entry)
    }

    return [...map.values()]
      .map((entry) => ({ ...entry, rate: entry.answered > 0 ? entry.correct / entry.answered : 0 }))
      .sort((a, b) => b.rate - a.rate)
  }, [state.rounds])

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <header className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[color:var(--brand-text-muted)]">
          Fin de partie
        </p>
        <h1 className="text-[clamp(1.6rem,3vw,2.5rem)]">
          {state.clientName ? `Résultats — ${state.clientName}` : 'Résultats'}
        </h1>
        <p className="mt-1 text-[color:var(--brand-text-muted)]">
          {state.rounds.length} question{state.rounds.length > 1 ? 's' : ''} posée
          {state.rounds.length > 1 ? 's' : ''} sur {themeStats.length} thème
          {themeStats.length > 1 ? 's' : ''}
          {answeredCount > 0 &&
            ` · ${Math.round((correctCount / answeredCount) * 100)} % de bonnes réponses`}
        </p>
      </header>

      {/* --- Podium ------------------------------------------------------ */}
      {standings.length > 0 ? (
        <section className="card mb-6 space-y-4 p-6">
          {standings.map((row, index) => {
            const color = teamColor(row.colorKey as never)
            return (
              <div key={row.teamId} className="flex items-center gap-4">
                <span className="w-10 shrink-0 text-center text-3xl" aria-hidden>
                  {row.rank <= 3 ? MEDALS[row.rank - 1] : ''}
                </span>
                <span className="w-8 shrink-0 text-xl font-bold tabular" aria-label={`Rang ${row.rank}`}>
                  {row.rank}
                </span>
                <TeamChip as="span" name={row.name} colorKey={row.colorKey as never} className="pointer-events-none min-w-40 shrink-0" />
                <div className="h-8 flex-1 overflow-hidden rounded-md" style={{ background: 'color-mix(in srgb, var(--brand-border) 40%, transparent)' }}>
                  <div
                    className="team-score-bar h-full"
                    style={{
                      width: grown ? `${Math.max(4, (row.score / maxScore) * 100)}%` : '0%',
                      background: color.hex,
                      transitionDelay: `${index * 120}ms`,
                    }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-2xl font-bold tabular">{row.score}</span>
              </div>
            )
          })}
        </section>
      ) : (
        <section className="card mb-6 p-6 text-center">
          <p className="text-lg">
            <strong className="text-3xl tabular">{correctCount}</strong> bonne
            {correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {answeredCount}
          </p>
        </section>
      )}

      {/* --- Thèmes maîtrisés / à renforcer ------------------------------ */}
      {themeStats.length > 0 && (
        <section className="card mb-6 p-6">
          <h2 className="mb-3 text-lg">Par thème</h2>
          <div className="space-y-2">
            {themeStats.map((theme) => (
              <div key={theme.label} className="flex items-center gap-3">
                {/* Pas de troncature : « Organisation de la prévention & RPS »
                    coupé en « Organisation de la pré… » n'apprend rien à une
                    direction qui lit le récapitulatif. */}
                <span className="w-64 shrink-0 text-sm font-semibold leading-tight">
                  {theme.label}
                </span>
                <div
                  className="h-4 flex-1 overflow-hidden rounded"
                  style={{ background: 'color-mix(in srgb, var(--brand-border) 40%, transparent)' }}
                >
                  <div
                    className="h-full rounded transition-[width] duration-700"
                    style={{
                      width: grown ? `${Math.round(theme.rate * 100)}%` : '0%',
                      background:
                        theme.rate >= 0.7
                          ? 'var(--brand-success)'
                          : theme.rate >= 0.4
                            ? 'var(--brand-accent)'
                            : 'var(--brand-danger)',
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right tabular text-sm">
                  {Math.round(theme.rate * 100)} %
                  <span className="ml-1 text-[color:var(--brand-text-muted)]">
                    ({theme.asked}q)
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-[color:var(--brand-text-muted)]">
            Aperçu indicatif&nbsp;: le rapport de synthèse détaillé pour la direction arrive en V3, mais
            toutes les données de cette séance sont déjà enregistrées.
          </p>
        </section>
      )}

      {/* --- Actions ----------------------------------------------------- */}
      <div className="no-print flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={onNewSession}>
          Nouvelle session
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          Imprimer les résultats
        </button>
        {/* Ceinture et bretelles : si absolument tout échoue, l'animateur
            repart avec un fichier. */}
        <button className="btn btn-ghost" onClick={onExport}>
          Exporter la session (JSON)
        </button>

        {pendingSync > 0 && (
          <span className="text-sm text-[color:var(--brand-text-muted)]">
            Synchronisation en attente — elle se fera automatiquement au retour du réseau.
          </span>
        )}
      </div>
    </main>
  )
}
