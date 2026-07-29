import type { TeamColorKey } from '@/lib/game/types'

/**
 * PALETTE DES 4 ÉQUIPES — non brandable, calibrée pour la projection.
 *
 * Contraintes satisfaites :
 *   - toutes VOLONTAIREMENT foncées (5 à 7:1 sur blanc). Sur un projecteur qui
 *     délave, une couleur foncée reste identifiable ; une couleur claire tend
 *     vers le blanc et disparaît. C'est la règle n°1 de la projection ;
 *   - écarts de teinte ≥ 60° partout : 227° / 22° / 163° / 295° ;
 *   - PAS de rouge pur : le couple rouge/vert est le problème n°1 du daltonisme
 *     (~8 % des hommes), et le rouge est déjà pris sémantiquement (faux) ;
 *   - PAS de jaune : illisible sur fond clair ET avec du texte blanc dessus.
 *     À défendre si un client réclame « 4 couleurs vives et fun » ;
 *   - vert BLEUTÉ (163°) et non vert franc (142°) : nettement moins confusable
 *     avec l'orange en deutéranopie.
 *
 * HONNÊTETÉ : il n'existe pas de palette de 4 couleurs saturées à la fois assez
 * foncées pour la projection et parfaitement sûres en daltonisme — les
 * luminances de 4 couleurs foncées sur blanc se regroupent nécessairement.
 * Orange/vert (deutéranopie) et violet/bleu restent partiellement confusables.
 *
 * D'où le CODAGE REDONDANT, qui n'est pas une option mais une obligation :
 *   1. forme du pion, distincte même en silhouette ;
 *   2. nom de l'équipe écrit dans ou sous le pion ;
 *   3. position stable de chaque équipe dans toutes les listes ;
 *   4. bordure blanche de 3 px, pour se détacher de n'importe quel fond.
 *
 * Vérification : Chrome DevTools > Rendering > Emulate vision deficiencies.
 * Si les 4 équipes restent distinguables en achromatopsie, c'est gagné.
 */

export interface TeamColor {
  key: TeamColorKey
  label: string
  hex: string
  /** Variante foncée, pour les bordures et les textes sur fond clair. */
  hexDark: string
  /** Forme du pion — le codage redondant qui sauve la lisibilité. */
  shape: 'circle' | 'triangle' | 'square' | 'diamond'
  shapeLabel: string
  /** Ratio de contraste avec du texte blanc, vérifié. */
  contrastOnWhiteText: number
}

export const TEAM_COLORS: Record<TeamColorKey, TeamColor> = {
  bleu: {
    key: 'bleu',
    label: 'Bleu',
    hex: '#1D4ED8',
    hexDark: '#1E3A8A',
    shape: 'circle',
    shapeLabel: 'rond',
    contrastOnWhiteText: 6.70,
  },
  orange: {
    key: 'orange',
    label: 'Orange',
    hex: '#C2410C',
    hexDark: '#9A3412',
    shape: 'triangle',
    shapeLabel: 'triangle',
    contrastOnWhiteText: 5.18,
  },
  vert: {
    key: 'vert',
    label: 'Vert',
    hex: '#047857',
    hexDark: '#065F46',
    shape: 'square',
    shapeLabel: 'carré',
    contrastOnWhiteText: 5.48,
  },
  violet: {
    key: 'violet',
    label: 'Violet',
    hex: '#A21CAF',
    hexDark: '#86198F',
    shape: 'diamond',
    shapeLabel: 'losange',
    contrastOnWhiteText: 6.32,
  },
}

export const TEAM_COLOR_ORDER: TeamColorKey[] = ['bleu', 'orange', 'vert', 'violet']

export function teamColor(key: TeamColorKey): TeamColor {
  return TEAM_COLORS[key]
}
