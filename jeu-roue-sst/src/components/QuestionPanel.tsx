'use client'

import { useEffect, useRef, useState } from 'react'
import { AnswerCard } from './AnswerCard'
import { TeamChip } from './TeamChip'
import { SOLO_KEY } from '@/lib/game/session-store'
import type { QuestionSnapshot, Team, Verdict } from '@/lib/game/types'

interface Props {
  snapshot: QuestionSnapshot
  teams: Team[]
  mode: 'teams' | 'solo'
  assignments: Record<string, string[]>
  pinnedTeamIds: string[]
  debateVerdicts: Record<string, Verdict>
  selectedTeamId: string | null
  revealed: boolean
  onSelectTeam: (teamId: string | null) => void
  onClickAnswer: (optionId: string) => void
  onDebateVerdict: (teamId: string, verdict: Verdict) => void
}

const VERDICT_BUTTONS: { verdict: Verdict; label: string; color: string }[] = [
  { verdict: 'correct', label: 'Correct', color: 'var(--brand-success)' },
  { verdict: 'partial', label: 'Partiel', color: 'var(--brand-accent)' },
  { verdict: 'incorrect', label: 'Incorrect', color: 'var(--brand-danger)' },
]

export function QuestionPanel({
  snapshot,
  teams,
  mode,
  assignments,
  pinnedTeamIds,
  debateVerdicts,
  selectedTeamId,
  revealed,
  onSelectTeam,
  onClickAnswer,
  onDebateVerdict,
}: Props) {
  const isDebate = snapshot.kind === 'debate'
  const isMulti = snapshot.kind === 'mcq_multi'

  /**
   * L'écran est PROJETÉ : afficher la réponse attendue avant que les équipes
   * aient répondu la révélerait à toute la salle. On la garde donc masquée par
   * défaut pendant la question, avec un bouton pour l'afficher si l'animateur
   * en a besoin — et un avertissement clair sur le fait qu'elle sera visible.
   * Elle s'affiche automatiquement à la correction, ce qui est aussi l'ordre
   * pédagogique correct : écouter, trancher, puis révéler.
   */
  const [showExpected, setShowExpected] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // À chaque nouvelle question : on remasque l'attendu et on remonte en haut de
  // la zone, sinon l'animateur hérite du défilement de la question précédente.
  useEffect(() => {
    setShowExpected(false)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [snapshot.questionId])

  // À la correction, le commentaire pédagogique doit être immédiatement visible :
  // c'est lui qu'on lit à voix haute.
  useEffect(() => {
    if (revealed) scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [revealed])

  /** Équipes actuellement placées sur une option donnée. */
  const teamsOn = (optionId: string) =>
    teams.filter((team) => (assignments[team.id] ?? []).includes(optionId))

  /** Équipes encore sans réponse : elles attendent dans la barre du bas. */
  const unplaced = teams.filter((team) => (assignments[team.id] ?? []).length === 0)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <header className="shrink-0">
        <p
          className="mb-1 inline-block rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' }}
        >
          {snapshot.themeLabel}
        </p>
        <h2 className="text-[clamp(1.2rem,2.1vw,2rem)] leading-tight">{snapshot.statement}</h2>
        {isMulti && !revealed && (
          <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--brand-accent)' }}>
            Plusieurs réponses attendues.
          </p>
        )}
      </header>

      {/* --- Corps défilant : c'est la SEULE zone autorisée à défiler, pour
              qu'un énoncé très long ne fasse jamais déborder la page. --- */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {/*
          Commentaire pédagogique EN PREMIER à la correction : c'est ce qu'on lit
          à voix haute, il ne doit pas obliger l'animateur à défiler. C'est aussi
          ce qui apporte la valeur aux participants — le reste n'est qu'un jeu.
        */}
        {revealed && (
          <div
            className="card space-y-2 p-4 print-break-avoid"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, var(--brand-surface))' }}
          >
            <p className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>
              À retenir
            </p>
            <p className="text-[clamp(0.9rem,1.2vw,1.1rem)]">{snapshot.explanation}</p>
            {snapshot.sourceRef && (
              <p className="text-sm text-[color:var(--brand-text-muted)]">Source&nbsp;: {snapshot.sourceRef}</p>
            )}
          </div>
        )}

        {isDebate ? (
          <div className="space-y-3">
            {revealed || showExpected ? (
              <div
                className="card p-4"
                style={{ background: 'color-mix(in srgb, var(--brand-accent) 8%, var(--brand-surface))' }}
              >
                <p className="mb-1 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--brand-accent)' }}>
                  Réponse attendue
                </p>
                <p className="text-[clamp(0.9rem,1.15vw,1.05rem)]">{snapshot.expectedAnswer}</p>
              </div>
            ) : (
              <button
                className="btn btn-secondary w-full"
                onClick={() => setShowExpected(true)}
                style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}
              >
                Voir la réponse attendue
                <span className="text-sm font-normal opacity-80">— visible par la salle</span>
              </button>
            )}

            <p className="text-sm text-[color:var(--brand-text-muted)]">
              Écoutez les réponses, puis tranchez pour {mode === 'solo' ? 'la salle' : 'chaque équipe'}.
            </p>

            {(mode === 'solo'
              ? [{ id: SOLO_KEY, name: 'La salle', colorKey: 'bleu' as const }]
              : teams
            ).map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-2">
                <TeamChip
                  as="span"
                  name={entry.name}
                  colorKey={entry.colorKey}
                  className="pointer-events-none min-w-36"
                />
                {VERDICT_BUTTONS.map((option) => {
                  const active = debateVerdicts[entry.id] === option.verdict
                  return (
                    <button
                      key={option.verdict}
                      className="btn"
                      style={
                        active
                          ? { background: option.color, color: '#fff' }
                          : { background: 'var(--brand-surface)', color: option.color, border: `2px solid ${option.color}` }
                      }
                      onClick={() => onDebateVerdict(entry.id, option.verdict)}
                      aria-pressed={active}
                      disabled={revealed}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          snapshot.options.map((option, index) => (
            <AnswerCard
              key={option.id}
              label={option.label}
              shortcut={index + 1}
              teams={teamsOn(option.id)}
              pinnedTeamIds={pinnedTeamIds}
              selectedTeamId={selectedTeamId}
              revealed={revealed}
              isCorrect={option.isCorrect}
              soloSelected={mode === 'solo' && (assignments[SOLO_KEY] ?? []).includes(option.id)}
              onSelect={() => onClickAnswer(option.id)}
              onTeamClick={(teamId) => onSelectTeam(teamId)}
            />
          ))
        )}
      </div>

      {/* --- Équipes en attente ---------------------------------------- */}
      {!revealed && !isDebate && mode === 'teams' && unplaced.length > 0 && (
        <div className="shrink-0 border-t pt-2" style={{ borderColor: 'var(--brand-border)' }}>
          <p className="mb-1.5 text-sm font-semibold text-[color:var(--brand-text-muted)]">
            {selectedTeamId
              ? 'Cliquez maintenant la réponse de cette équipe.'
              : 'Sans réponse — cliquez un pion puis une réponse, ou cliquez directement une réponse pour toutes les placer.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((team) => (
              <TeamChip
                key={team.id}
                name={team.name}
                colorKey={team.colorKey}
                selected={selectedTeamId === team.id}
                onClick={() => onSelectTeam(team.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
