/**
 * Contraste WCAG.
 *
 * Sert deux usages :
 *   1. calculer automatiquement `primaryContrast` (texte lisible sur la couleur
 *      principale du client) plutôt que de laisser quelqu'un le saisir ;
 *   2. dans l'éditeur de charte (V3), REFUSER une combinaison illisible et
 *      proposer la version corrigée. C'est ce qui empêche un client de rendre
 *      son propre jeu illisible.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

/** Accepte #rgb, #rrggbb, avec ou sans dièse. Renvoie null si non reconnu. */
export function parseHex(input: string): Rgb | null {
  const hex = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const [r, g, b] = [...hex].map((c) => parseInt(c + c, 16))
    return { r: r!, g: g!, b: b! }
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    }
  }
  return null
}

export function toHex({ r, g, b }: Rgb): string {
  const part = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`
}

/** Luminance relative selon WCAG 2.1. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Ratio de contraste entre deux couleurs, de 1 (identiques) à 21 (noir/blanc). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

export const WHITE: Rgb = { r: 255, g: 255, b: 255 }
/** Quasi-noir plutôt que noir pur : plus doux à l'œil, contraste équivalent. */
export const NEAR_BLACK: Rgb = { r: 15, g: 23, b: 42 }

/**
 * Choisit le texte le plus lisible sur un fond donné : blanc ou quasi-noir.
 * C'est ce qui alimente le token `primaryContrast`.
 */
export function bestTextOn(background: string): string {
  const bg = parseHex(background)
  if (!bg) return toHex(NEAR_BLACK)
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, NEAR_BLACK)
    ? toHex(WHITE)
    : toHex(NEAR_BLACK)
}

/** Seuil WCAG AA pour du texte de taille normale. */
export const AA_NORMAL = 4.5
/** Seuil WCAG AA pour du grand texte (≥ 24 px, ou ≥ 18,66 px en gras). */
export const AA_LARGE = 3

export interface ContrastCheck {
  ratio: number
  passesNormal: boolean
  passesLarge: boolean
}

export function checkContrast(foreground: string, background: string): ContrastCheck | null {
  const fg = parseHex(foreground)
  const bg = parseHex(background)
  if (!fg || !bg) return null
  const ratio = contrastRatio(fg, bg)
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesNormal: ratio >= AA_NORMAL,
    passesLarge: ratio >= AA_LARGE,
  }
}

/**
 * Assombrit (ou éclaircit) une couleur juste assez pour atteindre le ratio
 * demandé face à `against`. Utilisé par l'éditeur de charte pour proposer une
 * correction au lieu de se contenter d'un message d'erreur.
 *
 * @returns la couleur corrigée, ou la couleur d'origine si l'objectif est
 *          inatteignable (ce qui n'arrive pas avec un fond blanc ou noir).
 */
export function adjustForContrast(color: string, against: string, target = AA_NORMAL): string {
  const base = parseHex(color)
  const bg = parseHex(against)
  if (!base || !bg) return color
  if (contrastRatio(base, bg) >= target) return color

  // On assombrit si le fond est clair, on éclaircit sinon.
  const towardsDark = relativeLuminance(bg) > 0.5
  let best = base

  // 40 pas de 2,5 % : suffisant pour couvrir tout l'écart, sans dichotomie.
  for (let i = 1; i <= 40; i++) {
    const factor = i / 40
    const candidate: Rgb = towardsDark
      ? { r: base.r * (1 - factor), g: base.g * (1 - factor), b: base.b * (1 - factor) }
      : {
          r: base.r + (255 - base.r) * factor,
          g: base.g + (255 - base.g) * factor,
          b: base.b + (255 - base.b) * factor,
        }
    best = candidate
    if (contrastRatio(candidate, bg) >= target) break
  }

  return toHex(best)
}
