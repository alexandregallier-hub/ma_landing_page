import { bestTextOn } from './contrast'
import type { BrandTokens } from './tokens'

/**
 * Charte maison, calibrée pour la projection en plein jour.
 *
 * Choix à ne pas défaire sans raison :
 *   - bg = #F8FAFC et non #FFFFFF pur : le blanc pur est éblouissant à courte
 *     distance, et il rend les bords de cartes invisibles ;
 *   - text = #0F172A, quasi-noir : un gris moyen disparaît en projection ;
 *   - fontSans sans aucune graisse fine — les fontes légères s'effacent
 *     littéralement au vidéoprojecteur (cf. globals.css, graisse min. 500).
 */
export const DEFAULT_TOKENS: BrandTokens = {
  primary: '#0F4C81',
  primaryContrast: '#ffffff',
  secondary: '#1E3A5F',
  accent: '#D97706',

  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#475569',
  border: '#CBD5E1',

  success: '#16A34A',
  danger: '#DC2626',

  radius: '12px',
  fontSans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontDisplay: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  logoHeight: '40px',
  shadow: '0 1px 3px rgba(15, 23, 42, 0.12), 0 8px 24px rgba(15, 23, 42, 0.06)',
}

/**
 * Fusionne les tokens stockés en base (jsonb, potentiellement partiels ou
 * saisis par un humain) avec les valeurs par défaut.
 *
 * Deux garde-fous appliqués systématiquement :
 *   - on ignore toute clé inconnue ou non textuelle (le jsonb n'est pas typé) ;
 *   - `primaryContrast` est TOUJOURS recalculé à partir de `primary`, jamais
 *     repris tel quel : c'est ce qui garantit un texte lisible sur les boutons
 *     quelle que soit la couleur choisie par le client.
 */
export function resolveTokens(stored: unknown): BrandTokens {
  const tokens: BrandTokens = { ...DEFAULT_TOKENS }

  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
      if (!(key in DEFAULT_TOKENS)) continue
      if (typeof value !== 'string' || value.trim() === '') continue
      tokens[key as keyof BrandTokens] = value.trim()
    }
  }

  tokens.primaryContrast = bestTextOn(tokens.primary)
  return tokens
}
