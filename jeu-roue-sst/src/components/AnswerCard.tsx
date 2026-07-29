'use client'

import { TeamChip } from './TeamChip'
import type { Team } from '@/lib/game/types'

interface Props {
  label: string
  /** Raccourci clavier affiché (1 à 4). */
  shortcut: number
  /** Équipes actuellement placées sur cette réponse. */
  teams: Team[]
  pinnedTeamIds: string[]
  selectedTeamId: string | null
  /** true après validation, pour colorer juste / faux. */
  revealed: boolean
  isCorrect: boolean
  /** Réponse choisie en mode sans équipe. */
  soloSelected: boolean
  onSelect: () => void
  onTeamClick: (teamId: string) => void
}

/**
 * Carte-réponse.
 *
 * ERGONOMIE — pourquoi pas de glisser-déposer :
 * l'animateur regarde l'écran projeté à 3 mètres tout en manipulant un
 * trackpad. Un glisser exige de la précision sur DEUX points, un clic sur un
 * seul ; et un pion lâché dans le vide devant vingt salariés casse le rythme.
 * Sur 4 équipes × 20 questions, cela fait jusqu'à 80 manipulations par séance.
 *
 * Le modèle retenu :
 *   - clic sur la CARTE (ou touche 1-4) → toutes les équipes non épinglées
 *     s'y placent. C'est le comportement par défaut demandé ;
 *   - clic sur un PION d'équipe (ici ou dans la barre), puis clic sur une
 *     carte → cette équipe seule s'y place et devient épinglée.
 */
export function AnswerCard({
  label,
  shortcut,
  teams,
  pinnedTeamIds,
  selectedTeamId,
  revealed,
  isCorrect,
  soloSelected,
  onSelect,
  onTeamClick,
}: Props) {
  const state = revealed ? (isCorrect ? 'correct' : 'wrong') : undefined

  return (
    // Volontairement un div et non un <button> : la carte contient les pions
    // d'équipe, qui sont eux-mêmes des boutons — imbriquer deux éléments
    // interactifs est invalide. L'accès clavier passe par les touches 1 à 4,
    // affichées sur chaque carte.
    <div
      className="answer print-break-avoid"
      data-state={state}
      onClick={onSelect}
      aria-label={`Réponse ${shortcut} : ${label}`}
    >
      <div className="flex items-start gap-3">
        <span className="answer-key shrink-0" aria-hidden>
          {shortcut}
        </span>
        <span className="flex-1 text-[clamp(0.95rem,1.35vw,1.3rem)] font-semibold leading-snug">
          {label}
        </span>
        {revealed && (
          <span
            className="shrink-0 text-2xl font-bold"
            style={{ color: isCorrect ? 'var(--brand-success)' : 'var(--brand-danger)' }}
            // Le symbole double la couleur : jamais la couleur seule.
            aria-label={isCorrect ? 'Bonne réponse' : 'Mauvaise réponse'}
          >
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
        {soloSelected && !revealed && (
          <span className="shrink-0 text-2xl" style={{ color: 'var(--brand-primary)' }} aria-label="Réponse choisie">
            ●
          </span>
        )}
      </div>

      {teams.length > 0 && (
        // stopPropagation : sans lui, cliquer un pion déclencherait AUSSI le
        // clic sur la carte, qui déplacerait toutes les équipes non épinglées.
        <div className="flex flex-wrap gap-2 pl-11" onClick={(event) => event.stopPropagation()}>
          {teams.map((team) => (
            <TeamChip
              key={team.id}
              name={team.name}
              colorKey={team.colorKey}
              pinned={pinnedTeamIds.includes(team.id)}
              selected={selectedTeamId === team.id}
              onClick={() => onTeamClick(team.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
