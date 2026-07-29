'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TEAM_COLOR_ORDER, teamColor } from '@/lib/branding/teams'
import { useSession } from '@/lib/game/session-store'
import { findResumableSession } from '@/lib/game/persistence'
import type { PersistedState } from '@/lib/game/session-store'
import type { QuestionBank, SessionMode } from '@/lib/game/types'
import { TeamChip } from './TeamChip'
import { useEffect } from 'react'

interface Props {
  orgId: string
  bank: QuestionBank
  /** Mode démonstration : la partie ne remonte nulle part. */
  demo?: boolean
}

export function SetupForm({ orgId, bank, demo = false }: Props) {
  const router = useRouter()
  const initSession = useSession((s) => s.initSession)
  const hydrate = useSession((s) => s.hydrate)

  const [mode, setMode] = useState<SessionMode>('teams')
  const [teamCount, setTeamCount] = useState(2)
  const [names, setNames] = useState<string[]>(['', '', '', ''])
  const [clientName, setClientName] = useState('')
  const [location, setLocation] = useState('')
  const [audienceSize, setAudienceSize] = useState('')
  const [questionLimit, setQuestionLimit] = useState(20)
  const [resumable, setResumable] = useState<{ clientSessionId: string; state: PersistedState } | null>(null)

  const maxQuestions = bank.questions.length

  // Proposer de reprendre une partie interrompue : onglet fermé par erreur,
  // navigateur planté, PC en veille au milieu d'une séance.
  useEffect(() => {
    void findResumableSession<PersistedState>().then((found) => {
      if (found && found.state.rounds?.length > 0) setResumable(found)
    })
  }, [])

  const effectiveLimit = useMemo(
    () => Math.min(questionLimit, maxQuestions),
    [questionLimit, maxQuestions],
  )

  function start() {
    initSession(
      {
        orgId,
        demo,
        brandProfileId: null,
        mode,
        teamNames: mode === 'teams' ? names.slice(0, teamCount) : [],
        title: null,
        clientName: clientName.trim() || null,
        location: location.trim() || null,
        audienceSize: audienceSize ? Number(audienceSize) : null,
        questionLimit: effectiveLimit,
      },
      bank,
    )
    router.push('/jouer')
  }

  function resume() {
    if (!resumable) return
    hydrate(resumable.state)
    router.push('/jouer')
  }

  return (
    <div className="space-y-6">
      {resumable && (
        <div className="card space-y-3 border-2 p-5" style={{ borderColor: 'var(--brand-accent)' }}>
          <h2 className="text-lg">Reprendre la session en cours ?</h2>
          <p className="text-[color:var(--brand-text-muted)]">
            Une partie non terminée a été trouvée&nbsp;: {resumable.state.rounds.length} question(s)
            déjà posée(s)
            {resumable.state.clientName ? ` chez ${resumable.state.clientName}` : ''}. Les scores sont
            intacts.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={resume}>
              Reprendre
            </button>
            <button className="btn btn-ghost" onClick={() => setResumable(null)}>
              Ignorer et créer une nouvelle session
            </button>
          </div>
        </div>
      )}

      {/* --- Mode ------------------------------------------------------- */}
      <section className="card space-y-4 p-5">
        <h2 className="text-lg">Mode de jeu</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className={`btn ${mode === 'teams' ? 'btn-primary' : 'btn-secondary'} h-auto flex-col items-start py-3 text-left`}
            onClick={() => setMode('teams')}
            aria-pressed={mode === 'teams'}
          >
            <span className="font-bold">Avec équipes</span>
            <span className="text-sm font-normal opacity-80">
              Jusqu’à 4 équipes, score par équipe, podium
            </span>
          </button>
          <button
            className={`btn ${mode === 'solo' ? 'btn-primary' : 'btn-secondary'} h-auto flex-col items-start py-3 text-left`}
            onClick={() => setMode('solo')}
            aria-pressed={mode === 'solo'}
          >
            <span className="font-bold">Sans équipe</span>
            <span className="text-sm font-normal opacity-80">
              Version simplifiée&nbsp;: la salle répond collectivement
            </span>
          </button>
        </div>
      </section>

      {/* --- Équipes ---------------------------------------------------- */}
      {mode === 'teams' && (
        <section className="card space-y-4 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg">Équipes</h2>
            <p className="text-sm text-[color:var(--brand-text-muted)]">
              Les couleurs sont imposées&nbsp;: elles sont choisies pour rester lisibles au
              vidéoprojecteur en plein jour.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`btn ${teamCount === n ? 'btn-primary' : 'btn-secondary'} min-w-14`}
                onClick={() => setTeamCount(n)}
                aria-pressed={teamCount === n}
                aria-label={`${n} équipe${n > 1 ? 's' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {Array.from({ length: teamCount }, (_, i) => {
              const colorKey = TEAM_COLOR_ORDER[i]!
              const color = teamColor(colorKey)
              return (
                <div key={i} className="flex items-center gap-3">
                  <TeamChip
                    as="span"
                    name={names[i]?.trim() || `Équipe ${i + 1}`}
                    colorKey={colorKey}
                    className="pointer-events-none min-w-40"
                  />
                  <input
                    className="field flex-1"
                    placeholder={`Nom de l’équipe ${color.label.toLowerCase()}`}
                    value={names[i] ?? ''}
                    maxLength={24}
                    onChange={(e) => {
                      const next = [...names]
                      next[i] = e.target.value
                      setNames(next)
                    }}
                    aria-label={`Nom de l’équipe ${i + 1} (${color.label})`}
                  />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* --- Contexte --------------------------------------------------- */}
      <section className="card space-y-4 p-5">
        <h2 className="text-lg">Contexte de la séance</h2>
        <p className="text-sm text-[color:var(--brand-text-muted)]">
          Facultatif, mais c’est ce qui rendra les rapports exploitables&nbsp;: sans nom de client, on
          ne peut pas comparer les thèmes maîtrisés d’une entreprise à l’autre.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="client" className="mb-1 block font-semibold">
              Entreprise
            </label>
            <input
              id="client"
              className="field"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex. Métallerie Dupont"
            />
          </div>
          <div>
            <label htmlFor="lieu" className="mb-1 block font-semibold">
              Lieu
            </label>
            <input
              id="lieu"
              className="field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex. Atelier — Poitiers"
            />
          </div>
          <div>
            <label htmlFor="participants" className="mb-1 block font-semibold">
              Nombre de participants
            </label>
            <input
              id="participants"
              type="number"
              min={0}
              max={500}
              className="field"
              value={audienceSize}
              onChange={(e) => setAudienceSize(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="limite" className="mb-1 block font-semibold">
              Nombre de questions
            </label>
            <input
              id="limite"
              type="number"
              min={1}
              max={Math.max(1, maxQuestions)}
              className="field"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(Math.max(1, Number(e.target.value) || 1))}
            />
            <p className="mt-1 text-sm text-[color:var(--brand-text-muted)]">
              {maxQuestions} questions disponibles sur {bank.themes.length} thèmes.
              {questionLimit > maxQuestions && ` La partie s’arrêtera à ${maxQuestions}.`}
            </p>
          </div>
        </div>
      </section>

      <button className="btn btn-primary w-full text-lg" onClick={start}>
        Démarrer la session
      </button>

      <p className="text-center text-sm text-[color:var(--brand-text-muted)]">
        {demo ? (
          <>
            Mode démonstration&nbsp;: la partie se déroule normalement, mais{' '}
            <strong>aucun résultat n’est enregistré</strong>.
          </>
        ) : (
          <>
            Une fois démarrée, la partie fonctionne <strong>sans connexion internet</strong>. Les
            résultats remonteront automatiquement au retour du réseau.
          </>
        )}
      </p>
    </div>
  )
}
