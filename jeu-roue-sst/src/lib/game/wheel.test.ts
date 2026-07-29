import { describe, expect, it } from 'vitest'
import {
  buildCandidates,
  computeTargetAngle,
  mod,
  pickQuestion,
  pickWeightedTheme,
  sectorAtPointer,
  sectorSize,
  type ThemeCandidate,
} from './wheel'
import type { QuestionBank } from './types'

/** Générateur déterministe : suite de valeurs consommées dans l'ordre, en boucle. */
function seq(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('mod', () => {
  it('reste positif pour les entrées négatives', () => {
    expect(mod(-10, 360)).toBe(350)
    expect(mod(-370, 360)).toBe(350)
    expect(mod(0, 360)).toBe(0)
    expect(mod(360, 360)).toBe(0)
  })
})

describe('computeTargetAngle', () => {
  // Le test qui compte vraiment : quel que soit le secteur visé, quel que soit
  // le nombre de secteurs, et quelle que soit la rotation déjà accumulée, la
  // flèche doit désigner le secteur demandé.
  for (const count of [8, 9, 10]) {
    for (const startRotation of [0, 37.5, 1234.9, -415.2]) {
      it(`désigne le bon secteur (${count} secteurs, départ à ${startRotation}°)`, () => {
        for (let sector = 0; sector < count; sector++) {
          // On balaie tout l'intervalle du jitter, bornes incluses.
          for (const r of [0, 0.001, 0.25, 0.5, 0.75, 0.999]) {
            const plan = computeTargetAngle(startRotation, sector, count, seq([r]))
            expect(sectorAtPointer(plan.targetRotation, count)).toBe(sector)
            expect(plan.sectorIndex).toBe(sector)
          }
        }
      })
    }
  }

  it('tourne toujours vers l’avant, de 4 à 6 tours complets', () => {
    for (const r of [0, 0.34, 0.67, 0.999]) {
      const plan = computeTargetAngle(0, 3, 10, seq([r]))
      const delta = plan.targetRotation - 0
      expect(delta).toBeGreaterThanOrEqual(4 * 360)
      expect(delta).toBeLessThan(7 * 360)
    }
  })

  it('ne s’arrête jamais sur une frontière de secteur', () => {
    const size = sectorSize(10)
    for (let sector = 0; sector < 10; sector++) {
      for (const r of [0, 0.5, 1 - 1e-9]) {
        const plan = computeTargetAngle(0, sector, 10, seq([r]))
        const offset = mod(mod(-plan.targetRotation, 360), size)
        // Le jitter est borné à ±0.35·pas autour du centre → [0.15, 0.85]·pas.
        expect(offset).toBeGreaterThan(0.1 * size)
        expect(offset).toBeLessThan(0.9 * size)
      }
    }
  })

  it('ne s’arrête pas systématiquement au centre du secteur', () => {
    const size = sectorSize(10)
    const centre = size / 2
    const offsets = [0.1, 0.9].map((r) => {
      const plan = computeTargetAngle(0, 5, 10, seq([r]))
      return mod(mod(-plan.targetRotation, 360), size)
    })
    // Les deux extrêmes du jitter encadrent le centre et s'en écartent.
    expect(offsets[0]!).toBeLessThan(centre)
    expect(offsets[1]!).toBeGreaterThan(centre)
  })

  it('cumule la rotation d’un tirage au suivant, sans revenir en arrière', () => {
    let rotation = 0
    for (let i = 0; i < 20; i++) {
      const next = computeTargetAngle(rotation, i % 10, 10, seq([0.42])).targetRotation
      expect(next).toBeGreaterThan(rotation)
      rotation = next
    }
  })
})

describe('sectorAtPointer', () => {
  it('désigne le secteur 0 à la rotation nulle', () => {
    expect(sectorAtPointer(0, 10)).toBe(0)
  })

  it('est invariant modulo 360', () => {
    expect(sectorAtPointer(-100, 10)).toBe(sectorAtPointer(-100 + 3600, 10))
  })

  it('reste dans les bornes pour toute rotation', () => {
    for (const count of [8, 9, 10]) {
      for (let r = -1000; r <= 1000; r += 7.3) {
        const s = sectorAtPointer(r, count)
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThan(count)
      }
    }
  })
})

describe('pickWeightedTheme', () => {
  const candidates = (spec: [string, number, number][]): ThemeCandidate[] =>
    spec.map(([themeId, remaining, draws]) => ({ themeId, remaining, draws }))

  it('ne renvoie jamais un thème épuisé', () => {
    const c = candidates([
      ['a', 0, 0],
      ['b', 0, 5],
      ['c', 3, 0],
    ])
    for (let i = 0; i < 200; i++) {
      expect(pickWeightedTheme(c, null, () => i / 200)).toBe('c')
    }
  })

  it('renvoie null quand toute la banque est épuisée', () => {
    expect(
      pickWeightedTheme(
        candidates([
          ['a', 0, 1],
          ['b', 0, 2],
        ]),
        null,
      ),
    ).toBeNull()
  })

  it('n’enchaîne jamais deux fois le même thème', () => {
    const c = candidates([
      ['a', 5, 0],
      ['b', 5, 0],
      ['c', 5, 0],
    ])
    for (let i = 0; i < 300; i++) {
      expect(pickWeightedTheme(c, 'a', () => i / 300)).not.toBe('a')
    }
  })

  it('accepte de rejouer le thème précédent s’il ne reste que lui', () => {
    const c = candidates([
      ['a', 4, 3],
      ['b', 0, 2],
    ])
    expect(pickWeightedTheme(c, 'a', () => 0.5)).toBe('a')
  })

  it('privilégie les thèmes les moins tirés', () => {
    // Poids : a → 1/(1+9) = 0.1 ; b → 1/(1+0) = 1. b doit sortir ~10x plus.
    const c = candidates([
      ['a', 10, 9],
      ['b', 10, 0],
    ])
    let countB = 0
    const n = 2000
    let state = 1
    const rng = () => {
      // LCG déterministe : reproductible sans dépendre de Math.random.
      state = (state * 1103515245 + 12345) % 2147483648
      return state / 2147483648
    }
    for (let i = 0; i < n; i++) {
      if (pickWeightedTheme(c, null, rng) === 'b') countB++
    }
    expect(countB / n).toBeGreaterThan(0.8)
  })

  it('converge vers une couverture équilibrée sur une séance de 20 tirages', () => {
    const themes = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10']
    const draws: Record<string, number> = Object.fromEntries(themes.map((t) => [t, 0]))
    let previous: string | null = null
    let state = 7
    const rng = () => {
      state = (state * 1103515245 + 12345) % 2147483648
      return state / 2147483648
    }

    for (let i = 0; i < 20; i++) {
      const c = themes.map((themeId) => ({ themeId, remaining: 20 - draws[themeId]!, draws: draws[themeId]! }))
      const picked = pickWeightedTheme(c, previous, rng)
      expect(picked).not.toBeNull()
      draws[picked!]! += 1
      previous = picked
    }

    const counts = themes.map((t) => draws[t]!)
    // 20 tirages sur 10 thèmes : la pondération 1/(1+n) doit éviter tout excès.
    // Sans pondération, un thème pourrait sortir 5 ou 6 fois.
    expect(Math.max(...counts)).toBeLessThanOrEqual(3)
    // Et surtout : aucun thème ne doit être totalement oublié.
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(1)
  })
})

describe('buildCandidates / pickQuestion', () => {
  const bank: QuestionBank = {
    themes: [
      { id: 'th1', key: 'a', label: 'A', shortLabel: 'A', description: null, icon: null, sortOrder: 1 },
      { id: 'th2', key: 'b', label: 'B', shortLabel: 'B', description: null, icon: null, sortOrder: 2 },
    ],
    questions: [
      { id: 'q1', themeId: 'th1', kind: 'mcq_single', statement: '1', explanation: '', expectedAnswer: null, sourceRef: null, difficulty: null, options: [] },
      { id: 'q2', themeId: 'th1', kind: 'mcq_single', statement: '2', explanation: '', expectedAnswer: null, sourceRef: null, difficulty: null, options: [] },
      { id: 'q3', themeId: 'th2', kind: 'mcq_single', statement: '3', explanation: '', expectedAnswer: null, sourceRef: null, difficulty: null, options: [] },
    ],
  }

  it('compte les questions restantes par thème', () => {
    const c = buildCandidates(bank, new Set(['q1']), { th1: 1 })
    expect(c).toEqual([
      { themeId: 'th1', remaining: 1, draws: 1 },
      { themeId: 'th2', remaining: 1, draws: 0 },
    ])
  })

  it('conserve l’ordre des thèmes de la banque (= ordre des secteurs)', () => {
    const c = buildCandidates(bank, [], {})
    expect(c.map((x) => x.themeId)).toEqual(['th1', 'th2'])
  })

  it('ne repose jamais une question déjà posée', () => {
    const asked = new Set(['q1'])
    for (let i = 0; i < 50; i++) {
      const q = pickQuestion(bank, 'th1', asked, () => i / 50)
      expect(q?.id).toBe('q2')
    }
  })

  it('renvoie null sur un thème épuisé', () => {
    expect(pickQuestion(bank, 'th1', new Set(['q1', 'q2']))).toBeNull()
  })

  it('joue toute la banque d’un thème sans répétition ni blocage', () => {
    const asked = new Set<string>()
    const seen: string[] = []
    let state = 3
    const rng = () => {
      state = (state * 1103515245 + 12345) % 2147483648
      return state / 2147483648
    }
    for (let i = 0; i < 2; i++) {
      const q = pickQuestion(bank, 'th1', asked, rng)
      expect(q).not.toBeNull()
      asked.add(q!.id)
      seen.push(q!.id)
    }
    expect(new Set(seen).size).toBe(2)
    expect(pickQuestion(bank, 'th1', asked, rng)).toBeNull()
  })
})
