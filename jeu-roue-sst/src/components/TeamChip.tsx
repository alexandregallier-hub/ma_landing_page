'use client'

import { teamColor } from '@/lib/branding/teams'
import type { TeamColorKey } from '@/lib/game/types'

interface Props {
  name: string
  colorKey: TeamColorKey
  /** Équipe sélectionnée : le prochain clic sur une réponse la placera. */
  selected?: boolean
  /** Équipe déplacée à la main : un clic sur une réponse ne la bouge plus. */
  pinned?: boolean
  score?: number
  onClick?: () => void
  as?: 'button' | 'span'
  className?: string
}

/**
 * Pion d'équipe.
 *
 * Trois codages redondants systématiques, parce qu'aucune palette de 4 couleurs
 * saturées n'est parfaitement sûre en daltonisme : la couleur, la FORME, et le
 * NOM écrit. En achromatopsie totale, la forme suffit encore à distinguer les
 * quatre équipes.
 */
export function TeamChip({
  name,
  colorKey,
  selected = false,
  pinned = false,
  score,
  onClick,
  as = 'button',
  className = '',
}: Props) {
  const color = teamColor(colorKey)
  const Tag = as

  const label = selected
    ? `Équipe ${name}, ${color.shapeLabel} ${color.label.toLowerCase()}, sélectionnée — cliquez une réponse pour la placer`
    : `Équipe ${name}, ${color.shapeLabel} ${color.label.toLowerCase()}${pinned ? ', placée manuellement' : ''}`

  return (
    <Tag
      type={as === 'button' ? 'button' : undefined}
      className={`team-chip team-${colorKey} ${className}`}
      data-selected={selected}
      data-pinned={pinned}
      aria-pressed={as === 'button' ? selected : undefined}
      aria-label={label}
      onClick={onClick}
    >
      <span className="team-shape" data-shape={color.shape} aria-hidden />
      <span>{name}</span>
      {score !== undefined && <span className="tabular opacity-90">{score}</span>}
    </Tag>
  )
}
