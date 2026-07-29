import { describe, expect, it } from 'vitest'
import {
  adjustForContrast,
  bestTextOn,
  checkContrast,
  contrastRatio,
  parseHex,
  toHex,
  NEAR_BLACK,
  WHITE,
} from './contrast'
import { DEFAULT_TOKENS, resolveTokens } from './defaults'
import { tokensToCss } from './to-css'
import { cssVarName } from './tokens'
import { TEAM_COLORS, TEAM_COLOR_ORDER } from './teams'

describe('parseHex / toHex', () => {
  it('accepte les formats courants', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(parseHex('  #1D4ED8 ')).toEqual({ r: 29, g: 78, b: 216 })
  })

  it('refuse ce qui n’est pas une couleur hexadécimale', () => {
    expect(parseHex('rouge')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
    expect(parseHex('')).toBeNull()
  })

  it('fait l’aller-retour sans perte', () => {
    expect(toHex(parseHex('#1D4ED8')!)).toBe('#1d4ed8')
  })
})

describe('contrastRatio', () => {
  it('donne 21 pour noir sur blanc et 1 pour deux couleurs identiques', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, WHITE)).toBeCloseTo(21, 1)
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5)
  })

  it('est symétrique', () => {
    const a = parseHex('#C2410C')!
    const b = parseHex('#F8FAFC')!
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
  })
})

describe('palette d’équipe — contraintes de projection', () => {
  it('les 4 couleurs restent lisibles avec du texte blanc (AA grand texte)', () => {
    for (const key of TEAM_COLOR_ORDER) {
      const color = TEAM_COLORS[key]
      const ratio = contrastRatio(parseHex(color.hex)!, WHITE)
      expect(ratio, `${color.label} (${color.hex})`).toBeGreaterThanOrEqual(4.5)
      // La valeur documentée doit rester fidèle au hex réel.
      expect(Math.abs(ratio - color.contrastOnWhiteText), `${color.label}`).toBeLessThan(0.3)
    }
  })

  it('les 4 couleurs se détachent du fond clair de l’application', () => {
    const bg = parseHex(DEFAULT_TOKENS.bg)!
    for (const key of TEAM_COLOR_ORDER) {
      const ratio = contrastRatio(parseHex(TEAM_COLORS[key].hex)!, bg)
      expect(ratio, `${key} sur ${DEFAULT_TOKENS.bg}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('aucune couleur d’équipe ne se confond avec le vert « juste » ou le rouge « faux »', () => {
    for (const semantic of [DEFAULT_TOKENS.success, DEFAULT_TOKENS.danger]) {
      for (const key of TEAM_COLOR_ORDER) {
        expect(TEAM_COLORS[key].hex.toLowerCase()).not.toBe(semantic.toLowerCase())
      }
    }
  })

  it('les 4 formes sont distinctes — c’est le codage redondant', () => {
    const shapes = TEAM_COLOR_ORDER.map((k) => TEAM_COLORS[k].shape)
    expect(new Set(shapes).size).toBe(4)
  })
})

describe('bestTextOn', () => {
  it('choisit du blanc sur les fonds foncés, du quasi-noir sur les fonds clairs', () => {
    expect(bestTextOn('#0F4C81')).toBe(toHex(WHITE))
    expect(bestTextOn('#F8FAFC')).toBe(toHex(NEAR_BLACK))
    expect(bestTextOn('#FFCC00')).toBe(toHex(NEAR_BLACK))
  })

  it('retombe sur le quasi-noir si la couleur est illisible', () => {
    expect(bestTextOn('pas-une-couleur')).toBe(toHex(NEAR_BLACK))
  })
})

describe('adjustForContrast', () => {
  it('laisse la couleur intacte si elle passe déjà', () => {
    expect(adjustForContrast('#0F4C81', '#FFFFFF')).toBe('#0F4C81')
  })

  it('assombrit une couleur trop claire pour un fond blanc', () => {
    const fixed = adjustForContrast('#FFD400', '#FFFFFF')
    expect(checkContrast(fixed, '#FFFFFF')!.passesNormal).toBe(true)
  })

  it('éclaircit une couleur trop foncée pour un fond noir', () => {
    const fixed = adjustForContrast('#1a1a2e', '#000000')
    expect(checkContrast(fixed, '#000000')!.passesNormal).toBe(true)
  })
})

describe('resolveTokens', () => {
  it('renvoie la charte maison sans entrée', () => {
    expect(resolveTokens(null).primary).toBe(DEFAULT_TOKENS.primary)
    expect(resolveTokens(undefined).bg).toBe(DEFAULT_TOKENS.bg)
    expect(resolveTokens({}).text).toBe(DEFAULT_TOKENS.text)
  })

  it('applique les surcharges du client', () => {
    expect(resolveTokens({ primary: '#003366' }).primary).toBe('#003366')
  })

  it('ignore les clés inconnues et les valeurs non textuelles', () => {
    const tokens = resolveTokens({ inventé: 'x', primary: 42, bg: '   ' })
    expect(tokens).not.toHaveProperty('inventé')
    expect(tokens.primary).toBe(DEFAULT_TOKENS.primary)
    expect(tokens.bg).toBe(DEFAULT_TOKENS.bg)
  })

  it('recalcule TOUJOURS primaryContrast, même si le client en fournit un mauvais', () => {
    // Un client qui met du blanc sur du jaune se retrouverait avec des boutons
    // illisibles : on ne lui fait pas confiance sur ce token.
    const tokens = resolveTokens({ primary: '#FFDD00', primaryContrast: '#ffffff' })
    expect(tokens.primaryContrast).toBe(toHex(NEAR_BLACK))
    expect(checkContrast(tokens.primaryContrast, tokens.primary)!.passesNormal).toBe(true)
  })

  it('garantit un contraste suffisant sur les boutons pour toute couleur principale', () => {
    for (const primary of ['#003366', '#FFDD00', '#FF0000', '#00FF00', '#888888', '#FFFFFF', '#000000']) {
      const tokens = resolveTokens({ primary })
      expect(checkContrast(tokens.primaryContrast, primary)!.passesLarge, primary).toBe(true)
    }
  })

  it('résiste à une entrée qui n’est pas un objet', () => {
    expect(resolveTokens('nope').primary).toBe(DEFAULT_TOKENS.primary)
    expect(resolveTokens([1, 2, 3]).primary).toBe(DEFAULT_TOKENS.primary)
  })
})

describe('cssVarName', () => {
  it('convertit le camelCase en kebab-case préfixé', () => {
    expect(cssVarName('primary')).toBe('--brand-primary')
    expect(cssVarName('textMuted')).toBe('--brand-text-muted')
    expect(cssVarName('primaryContrast')).toBe('--brand-primary-contrast')
  })
})

describe('tokensToCss', () => {
  it('produit une déclaration :root valide', () => {
    const css = tokensToCss(DEFAULT_TOKENS)
    expect(css.startsWith(':root{')).toBe(true)
    expect(css.endsWith('}')).toBe(true)
    expect(css).toContain('--brand-primary:#0F4C81')
  })

  it('neutralise une tentative d’évasion hors de la déclaration', () => {
    // Les tokens viennent d'un jsonb éditable : sans ce filtre, une valeur
    // malveillante réécrirait toute la feuille de style.
    const css = tokensToCss(resolveTokens({ primary: 'red; } body { display:none' }))
    expect(css).not.toContain('display:none')
    expect(css).not.toContain('body')
    expect((css.match(/\{/g) ?? []).length).toBe(1)
    expect((css.match(/\}/g) ?? []).length).toBe(1)
  })

  it('neutralise une injection de balise', () => {
    const css = tokensToCss(resolveTokens({ surface: '</style><script>alert(1)</script>' }))
    expect(css).not.toContain('<script')
    expect(css).not.toContain('</style')
  })

  it('conserve les valeurs légitimes complexes', () => {
    const css = tokensToCss(DEFAULT_TOKENS)
    expect(css).toContain('--brand-font-sans:system-ui')
    expect(css).toContain('rgba(15, 23, 42, 0.12)')
  })
})
