import { describe, expect, it } from 'vitest'
import { classificarBalanco, somarCalorias, TOLERANCIA_NORMO } from './balanco'
import type { Escolhas, Refeicao } from './types'

const refeicoes: Refeicao[] = [
  {
    id: 'cafe',
    nome: 'Café da manhã',
    horario: '07:00',
    opcoes: [
      { id: 'cafe-leve', nome: 'Leve', descricao: '', kcal: 300, nivel: 1, foto: '' },
      { id: 'cafe-pesado', nome: 'Pesado', descricao: '', kcal: 600, nivel: 4, foto: '' },
    ],
  },
  {
    id: 'almoco',
    nome: 'Almoço',
    horario: '12:00',
    opcoes: [{ id: 'almoco-1', nome: 'Prato feito', descricao: '', kcal: 800, nivel: 2, foto: '' }],
  },
  {
    id: 'jantar',
    nome: 'Jantar',
    horario: '19:00',
    opcoes: [{ id: 'jantar-1', nome: 'Sopa', descricao: '', kcal: 400, nivel: 1, foto: '' }],
  },
]

describe('somarCalorias', () => {
  it('mistura: opção escolhida + nao_faco + refeição ausente = só soma a opção', () => {
    const escolhas: Escolhas = {
      cafe: { tipo: 'opcao', opcaoId: 'cafe-leve' },
      almoco: { tipo: 'nao_faco' },
      // jantar: ausente do objeto de escolhas
    }
    expect(somarCalorias(escolhas, refeicoes)).toBe(300)
  })

  it('opcaoId desconhecido conta 0', () => {
    const escolhas: Escolhas = {
      cafe: { tipo: 'opcao', opcaoId: 'nao-existe' },
    }
    expect(somarCalorias(escolhas, refeicoes)).toBe(0)
  })

  it('todas as refeições escolhidas somam corretamente', () => {
    const escolhas: Escolhas = {
      cafe: { tipo: 'opcao', opcaoId: 'cafe-pesado' },
      almoco: { tipo: 'opcao', opcaoId: 'almoco-1' },
      jantar: { tipo: 'opcao', opcaoId: 'jantar-1' },
    }
    expect(somarCalorias(escolhas, refeicoes)).toBe(600 + 800 + 400)
  })

  it('objeto de escolhas vazio soma 0', () => {
    expect(somarCalorias({}, refeicoes)).toBe(0)
  })
})

describe('classificarBalanco', () => {
  it('vet 2000, ingerido 2050 → normocalórico (diferença 50 ≤ tolerância 100)', () => {
    const r = classificarBalanco(2000, 2050)
    expect(r.diferenca).toBe(50)
    expect(r.toleranciaKcal).toBe(Math.round(2000 * TOLERANCIA_NORMO))
    expect(r.classificacao).toBe('normocalorico')
  })

  it('vet 2000, ingerido 1899 → déficit (diferença −101 > tolerância 100)', () => {
    const r = classificarBalanco(2000, 1899)
    expect(r.diferenca).toBe(-101)
    expect(r.classificacao).toBe('deficit')
  })

  it('vet 2000, ingerido 2101 → superávit (diferença 101 > tolerância 100)', () => {
    const r = classificarBalanco(2000, 2101)
    expect(r.diferenca).toBe(101)
    expect(r.classificacao).toBe('superavit')
  })

  it('limite exato da tolerância (100) ainda é normocalórico', () => {
    expect(classificarBalanco(2000, 2100).classificacao).toBe('normocalorico')
    expect(classificarBalanco(2000, 1900).classificacao).toBe('normocalorico')
  })
})
