'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  REDUCED_SPIN_DURATION_MS,
  SETTLE_DURATION_MS,
  SPIN_DURATION_MS,
  SPIN_EASING,
  sectorSize,
} from '@/lib/game/wheel'
import type { Theme } from '@/lib/game/types'

/** Teintes des secteurs, dérivées de la charte : brandable sans effort. */
const SECTOR_FILLS = [
  'var(--brand-primary)',
  'color-mix(in srgb, var(--brand-primary) 72%, white)',
  'var(--brand-secondary)',
  'color-mix(in srgb, var(--brand-secondary) 70%, white)',
  'var(--brand-accent)',
  'color-mix(in srgb, var(--brand-accent) 70%, white)',
]

interface Props {
  themes: Theme[]
  /** Rotation absolue cible, cumulée. Le composant anime jusqu'à cette valeur. */
  rotation: number
  spinning: boolean
  /** Thèmes épuisés : grisés et hachurés. La roue ne peut de toute façon plus
   *  s'y arrêter, mais les participants doivent le voir. */
  exhaustedThemeIds: string[]
  /** Thème tiré : son secteur est mis en évidence à l'arrêt. */
  selectedThemeId: string | null
  onClick: () => void
  disabled: boolean
}

/**
 * Roue SVG animée par UNE SEULE transition CSS sur `transform`.
 *
 * Le navigateur compose la rotation sur le GPU : zéro JavaScript pendant les
 * 4,5 secondes d'animation. C'est ce qui la rend increvable sur le vieux
 * portable branché au projecteur de la salle.
 *
 * Structure en deux couches, et c'est important :
 *   - couche externe  → le « cliquet » final (keyframes ±1,5°)
 *   - couche interne  → la rotation principale
 * Les mettre sur le même élément ferait écraser la rotation par les keyframes
 * du cliquet, et la roue sauterait visuellement à 0° pendant 220 ms.
 */
export function Wheel({
  themes,
  rotation,
  spinning,
  exhaustedThemeIds,
  selectedThemeId,
  onClick,
  disabled,
}: Props) {
  const count = themes.length
  const size = sectorSize(count)
  const [settling, setSettling] = useState(false)

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Cliquet déclenché à l'arrêt, pas au départ.
  useEffect(() => {
    if (spinning || reducedMotion || rotation === 0) return
    setSettling(true)
    const timer = setTimeout(() => setSettling(false), SETTLE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [rotation, spinning, reducedMotion])

  const sectors = themes.map((theme, i) => {
    // Secteurs tracés dans le sens horaire à partir de midi (−90° en repère
    // trigonométrique), pour que l'angle 0 tombe pile sous la flèche fixe.
    const start = i * size - 90
    const end = start + size
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const r = 100

    const x1 = 100 + r * Math.cos(toRad(start))
    const y1 = 100 + r * Math.sin(toRad(start))
    const x2 = 100 + r * Math.cos(toRad(end))
    const y2 = 100 + r * Math.sin(toRad(end))

    const mid = start + size / 2

    // Texte RADIAL (le long du rayon) : c'est ce qui laisse le plus de place sur
    // un secteur de 36°.
    //
    // On ne cherche PAS à le maintenir à l'endroit. Le texte est peint sur la
    // roue, donc il tourne avec elle : à tout instant, la moitié des libellés
    // est inversée — exactement comme sur une vraie roue de loterie. Un
    // « retournement » calculé par secteur ne survivrait pas à la rotation et ne
    // ferait qu'ajouter de l'incohérence.
    //
    // Ce qui doit être instantanément lisible en projection, c'est le secteur
    // GAGNANT, et il l'est par trois moyens redondants : la flèche fixe, la mise
    // en évidence du secteur ci-dessous, et le nom du thème affiché en grand
    // dans le panneau de question.
    const labelRadius = 63
    const lx = 100 + labelRadius * Math.cos(toRad(mid))
    const ly = 100 + labelRadius * Math.sin(toRad(mid))

    // L'icône se place près du bord, là où le secteur est le plus large.
    const iconRadius = 89
    const ix = 100 + iconRadius * Math.cos(toRad(mid))
    const iy = 100 + iconRadius * Math.sin(toRad(mid))

    return {
      theme,
      path: `M 100 100 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${size > 180 ? 1 : 0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`,
      fill: SECTOR_FILLS[i % SECTOR_FILLS.length]!,
      labelX: lx,
      labelY: ly,
      labelRotation: mid,
      iconX: ix,
      iconY: iy,
      exhausted: exhaustedThemeIds.includes(theme.id),
      selected: !spinning && theme.id === selectedThemeId,
    }
  })

  const transition = spinning
    ? `transform ${reducedMotion ? REDUCED_SPIN_DURATION_MS : SPIN_DURATION_MS}ms ${SPIN_EASING}`
    : 'none'

  return (
    <div className="relative flex aspect-square h-full max-h-full w-full max-w-full items-center justify-center">
      {/* L'ombre est portée par un parent STATIQUE : un filter sur l'élément en
          rotation casserait la composition GPU et ferait chuter les FPS. */}
      <svg
        // viewBox symétrique autour de (100, 100) : la marge de 16 unités laisse
        // la place à la flèche au-dessus du disque, et transform-origin: 50% 50%
        // tombe donc exactement sur le centre de la roue.
        viewBox="-16 -16 232 232"
        className="wheel-shadow h-full w-full"
        role="img"
        aria-label={`Roue de ${count} thèmes santé-sécurité`}
      >
        <defs>
          {/* Hachures des secteurs épuisés : le codage ne repose pas
              uniquement sur le grisé. */}
          <pattern
            id="wheel-exhausted"
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="7" height="7" fill="#cbd5e1" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#64748b" strokeWidth="3" />
          </pattern>
        </defs>

        {/* --- Couche 1 : cliquet final --- */}
        <g className={settling ? 'wheel-settling' : undefined} style={{ transformOrigin: '50% 50%', transformBox: 'view-box' }}>
          {/* --- Couche 2 : rotation principale, le SEUL transform animé --- */}
          <g className="wheel-rotor" style={{ transform: `rotate(${rotation}deg)`, transition }}>
            {sectors.map((sector) => (
              <g key={sector.theme.id}>
                <path
                  d={sector.path}
                  fill={sector.exhausted ? 'url(#wheel-exhausted)' : sector.fill}
                  stroke={sector.selected ? 'var(--brand-text)' : 'var(--brand-surface)'}
                  strokeWidth={sector.selected ? 3 : 1.2}
                  // Le secteur gagnant s'éclaircit nettement : à 5 mètres, c'est
                  // ce qui rend le résultat lisible en un coup d'œil.
                  style={sector.selected ? { filter: 'brightness(1.28) saturate(1.15)' } : undefined}
                />
                {sector.theme.icon && (
                  <text
                    x={sector.iconX}
                    y={sector.iconY}
                    transform={`rotate(${sector.labelRotation} ${sector.iconX} ${sector.iconY})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    opacity={sector.exhausted ? 0.35 : 0.95}
                  >
                    {sector.theme.icon}
                  </text>
                )}
                <text
                  x={sector.labelX}
                  y={sector.labelY}
                  transform={`rotate(${sector.labelRotation} ${sector.labelX} ${sector.labelY})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sector.exhausted ? '#334155' : '#ffffff'}
                  fontSize={sector.selected ? 9.5 : 8}
                  fontWeight="700"
                  // Contour sombre derrière le texte blanc : il reste lisible
                  // quelle que soit la teinte du secteur, y compris sur les
                  // variantes claires de la charte du client.
                  style={
                    sector.exhausted
                      ? undefined
                      : { paintOrder: 'stroke', stroke: 'rgba(15,23,42,0.45)', strokeWidth: 2.2 }
                  }
                >
                  {sector.theme.shortLabel}
                </text>
                {sector.exhausted && (
                  <text
                    x={sector.labelX}
                    y={sector.labelY}
                    dy="7"
                    transform={`rotate(${sector.labelRotation} ${sector.labelX} ${sector.labelY})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#334155"
                    fontSize="5"
                    fontWeight="700"
                  >
                    0 restante
                  </text>
                )}
              </g>
            ))}
            <circle cx="100" cy="100" r="99.4" fill="none" stroke="var(--brand-surface)" strokeWidth="2" />
          </g>
        </g>

        {/* --- Éléments FIXES, hors des couches animées --- */}

        {/* Moyeu, purement visuel : c'est le bouton en surimpression qui capte
            les clics, pour que toute la roue soit cliquable. */}
        <circle
          cx="100"
          cy="100"
          r="27"
          fill="var(--brand-surface)"
          stroke="var(--brand-border)"
          strokeWidth="1.5"
          pointerEvents="none"
        />
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--brand-text)"
          fontSize="8.5"
          fontWeight="700"
          pointerEvents="none"
        >
          {spinning ? '…' : 'ESPACE'}
        </text>

        {/* Flèche fixe, toujours au sommet : c'est elle qui désigne le secteur. */}
        <path
          d="M 100 6 L 110 -12 L 90 -12 Z"
          fill="var(--brand-text)"
          stroke="var(--brand-surface)"
          strokeWidth="2"
          pointerEvents="none"
        />
      </svg>

      {/* Toute la surface de la roue est cliquable, pas seulement le moyeu :
          viser depuis l'écran projeté doit rester facile. */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="absolute inset-[6%] rounded-full disabled:cursor-default"
        // Sans ce blur, le bouton garde le focus après un clic souris et la
        // barre d'espace le redéclenche → double rotation. Piège classique.
        onMouseUp={(event) => event.currentTarget.blur()}
        aria-label="Lancer la roue (barre d’espace)"
      />
    </div>
  )
}
