/**
 * LE CONTRAT DE LA MARQUE BLANCHE.
 *
 * Toute l'architecture de personnalisation s'accroche à ce type. Il est
 * volontairement petit : 16 clés couvrent 90 % du besoin d'une charte
 * graphique, et un formulaire de 6 champs suffit à le remplir.
 *
 * ===========================================================================
 * CE QUI N'EST PAS BRANDABLE, ET POURQUOI
 *
 * Les 4 couleurs d'équipe (src/styles/teams.css) ne sont PAS dans ce contrat.
 * Ce sont des éléments fonctionnels de lisibilité au vidéoprojecteur, pas de
 * la décoration. Ouvertes à la personnalisation, un client y mettrait quatre
 * nuances de son bleu corporate et le jeu deviendrait injouable en projection.
 *
 * Idem pour le vert « bonne réponse » et le rouge « mauvaise réponse » : ils
 * portent du sens, ils ne suivent pas la charte.
 *
 * C'est un argument de qualité, pas une limitation — il faut savoir le vendre.
 * ===========================================================================
 */

export interface BrandTokens {
  /** Couleur principale : boutons, accents, en-têtes. */
  primary: string
  /** Couleur de texte lisible SUR primary. Calculée, jamais saisie. */
  primaryContrast: string
  secondary: string
  accent: string

  /** Fond général. Doit rester CLAIR : voir la note en bas de fichier. */
  bg: string
  /** Cartes et panneaux. */
  surface: string
  text: string
  textMuted: string
  border: string

  /** Verrouillés par défaut : ils portent du sens (juste / faux). */
  success: string
  danger: string

  radius: string
  fontSans: string
  fontDisplay: string
  /** Hauteur d'affichage du logo dans l'en-tête. */
  logoHeight: string
  shadow: string
}

/** Les clés, pour itérer sans risquer d'en oublier une. */
export const BRAND_TOKEN_KEYS: (keyof BrandTokens)[] = [
  'primary', 'primaryContrast', 'secondary', 'accent',
  'bg', 'surface', 'text', 'textMuted', 'border',
  'success', 'danger',
  'radius', 'fontSans', 'fontDisplay', 'logoHeight', 'shadow',
]

/** Champs réellement exposés dans l'éditeur de charte (V3). Les autres sont
 *  dérivés ou verrouillés. */
export const EDITABLE_TOKEN_KEYS: (keyof BrandTokens)[] = [
  'primary', 'secondary', 'accent', 'bg', 'surface', 'radius',
]

/**
 * Convertit une clé de token en nom de custom property CSS.
 * primary → --brand-primary ; textMuted → --brand-text-muted
 */
export function cssVarName(key: keyof BrandTokens): string {
  return '--brand-' + key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
}

/**
 * ===========================================================================
 * POURQUOI LE THÈME EST CLAIR ET NON SOMBRE
 *
 * Contre-intuitif, mais la physique tranche : un vidéoprojecteur ADDITIONNE de
 * la lumière, il n'en soustrait pas. Le « noir » projeté est en réalité le gris
 * de l'écran plus toute la lumière ambiante de la salle. En plein jour, un
 * thème sombre rend gris sale et délavé, avec des contrastes écrasés.
 *
 * De plus, le texte clair sur fond sombre « bave » en projection (halo, bloom,
 * désalignement des matrices) — or les énoncés de questions SONT du texte.
 *
 * À l'inverse, un projecteur de salle de réunion (2500-4000 lm) garde un fond
 * blanc réellement blanc. Il suffit alors que le texte soit assez foncé et
 * assez épais, ce qui est un problème beaucoup plus facile à résoudre.
 * ===========================================================================
 */
