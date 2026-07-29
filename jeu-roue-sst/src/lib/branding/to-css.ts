import { BRAND_TOKEN_KEYS, cssVarName, type BrandTokens } from './tokens'

/**
 * Interdit toute évasion hors de la déclaration CSS. Les tokens viennent d'un
 * jsonb éditable depuis l'admin : sans ce filtre, une valeur du genre
 * `red; } body { display:none` réécrirait la feuille de style.
 */
const SAFE_VALUE = /^[a-zA-Z0-9#().,%\-_' /]*$/

function sanitize(value: string): string {
  const trimmed = value.trim()
  if (!SAFE_VALUE.test(trimmed)) return ''
  return trimmed
}

/**
 * Sérialise les tokens en custom properties CSS, injectées en SSR dans un
 * `<style>` du layout.
 *
 * Injecter côté serveur plutôt que côté client donne trois choses : aucun flash
 * de charte au chargement, aucune hydratation à payer, et surtout aucun rebuild
 * ni redéploiement pour changer de charte.
 */
export function tokensToCss(tokens: BrandTokens, selector = ':root'): string {
  const declarations: string[] = []

  for (const key of BRAND_TOKEN_KEYS) {
    const value = sanitize(tokens[key])
    if (!value) continue
    declarations.push(`${cssVarName(key)}:${value}`)
  }

  return `${selector}{${declarations.join(';')}}`
}
