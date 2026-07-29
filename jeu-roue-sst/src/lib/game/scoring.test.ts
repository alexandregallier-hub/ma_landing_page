import { describe, expect, it } from 'vitest'
import { computeStandings, evaluateSelection, pointsFor } from './scoring'
import type { QuestionKind, QuestionSnapshot } from './types'

function snap(kind: QuestionKind, correctIndexes: number[]): QuestionSnapshot {
  return {
    questionId: 'q',
    themeId: 'th',
    themeLabel: 'Thème',
    kind,
    statement: 'Énoncé',
    explanation: 'Commentaire',
    expectedAnswer: kind === 'debate' ? 'Attendu' : null,
    sourceRef: null,
    options: ['a', 'b', 'c', 'd'].map((id, i) => ({
      id,
      label: id.toUpperCase(),
      isCorrect: correctIndexes.includes(i),
    })),
  }
}

describe('evaluateSelection — QCM à réponse unique', () => {
  const s = snap('mcq_single', [1]) // 'b' est la bonne réponse

  it('juste quand la bonne option est cochée', () => {
    expect(evaluateSelection(s, ['b'])).toBe('correct')
  })

  it('faux quand une mauvaise option est cochée', () => {
    expect(evaluateSelection(s, ['a'])).toBe('incorrect')
  })

  it('faux si plusieurs options sont cochées, même en incluant la bonne', () => {
    expect(evaluateSelection(s, ['a', 'b'])).toBe('incorrect')
  })

  it('non répondu quand rien n’est coché', () => {
    expect(evaluateSelection(s, [])).toBe('skipped')
  })
})

describe('evaluateSelection — QCM à réponses multiples', () => {
  const s = snap('mcq_multi', [0, 2]) // 'a' et 'c'

  it('juste sur correspondance exacte, quel que soit l’ordre', () => {
    expect(evaluateSelection(s, ['a', 'c'])).toBe('correct')
    expect(evaluateSelection(s, ['c', 'a'])).toBe('correct')
  })

  it('partiel sur sous-ensemble sans erreur', () => {
    expect(evaluateSelection(s, ['a'])).toBe('partial')
  })

  it('faux dès qu’une option incorrecte est cochée', () => {
    expect(evaluateSelection(s, ['a', 'b'])).toBe('incorrect')
    expect(evaluateSelection(s, ['a', 'c', 'd'])).toBe('incorrect')
  })
})

describe('evaluateSelection — question de débat', () => {
  it('laisse toujours l’animateur trancher', () => {
    const s = snap('debate', [])
    expect(evaluateSelection(s, [])).toBe('skipped')
    expect(evaluateSelection(s, ['a'])).toBe('skipped')
  })
})

describe('pointsFor', () => {
  it('applique le barème 1 / 0 du cahier des charges', () => {
    expect(pointsFor('correct')).toBe(1)
    expect(pointsFor('partial')).toBe(0)
    expect(pointsFor('incorrect')).toBe(0)
    expect(pointsFor('skipped')).toBe(0)
  })
})

describe('computeStandings', () => {
  const team = (id: string, score: number, sortOrder: number) => ({
    id,
    name: id.toUpperCase(),
    colorKey: 'bleu',
    score,
    sortOrder,
  })

  it('classe par score décroissant', () => {
    const s = computeStandings([team('a', 3, 0), team('b', 7, 1), team('c', 5, 2)])
    expect(s.map((x) => x.teamId)).toEqual(['b', 'c', 'a'])
    expect(s.map((x) => x.rank)).toEqual([1, 2, 3])
  })

  it('donne le même rang aux ex æquo et saute le suivant', () => {
    const s = computeStandings([team('a', 5, 0), team('b', 5, 1), team('c', 2, 2)])
    expect(s.map((x) => x.rank)).toEqual([1, 1, 3])
  })

  it('départage les ex æquo par ordre de création, pour un affichage stable', () => {
    const s = computeStandings([team('b', 5, 1), team('a', 5, 0)])
    expect(s.map((x) => x.teamId)).toEqual(['a', 'b'])
  })

  it('gère le cas où toutes les équipes sont à zéro', () => {
    const s = computeStandings([team('a', 0, 0), team('b', 0, 1)])
    expect(s.every((x) => x.rank === 1)).toBe(true)
  })

  it('ne modifie pas le tableau reçu', () => {
    const input = [team('a', 1, 0), team('b', 9, 1)]
    const copy = [...input]
    computeStandings(input)
    expect(input).toEqual(copy)
  })

  it('renvoie un classement vide sans équipe (mode solo)', () => {
    expect(computeStandings([])).toEqual([])
  })
})
