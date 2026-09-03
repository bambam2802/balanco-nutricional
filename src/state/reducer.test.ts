import { describe, expect, it } from 'vitest'
import { ESTADO_INICIAL, reducer, sanitizarEstado } from './reducer'
import { REFEICOES } from '../data/refeicoes'
import type { DadosPessoa } from '../domain/types'

const dadosValidos: DadosPessoa = {
  sexo: 'feminino',
  idade: 34,
  pesoKg: 68,
  alturaCm: 165,
  atividade: 'leve',
  cinturaCm: 84,
  quadrilCm: 100,
}

describe('sanitizarEstado (sessionStorage corrompido ou de versão antiga)', () => {
  it('devolve o estado inicial para lixo', () => {
    expect(sanitizarEstado(null)).toEqual(ESTADO_INICIAL)
    expect(sanitizarEstado('x')).toEqual(ESTADO_INICIAL)
    expect(sanitizarEstado({ passo: 'inexistente' })).toEqual(ESTADO_INICIAL)
  })

  it('preserva um estado válido completo', () => {
    const estado = {
      passo: 'balanco',
      dados: dadosValidos,
      equacao: 'fao',
      escolhas: { cafe: { tipo: 'opcao', opcaoId: 'cafe-2' }, ceia: { tipo: 'nao_faco' } },
      refeicaoAtual: 3,
    }
    expect(sanitizarEstado(estado)).toEqual(estado)
  })

  it('descarta dados parciais e volta ao passo de dados', () => {
    const r = sanitizarEstado({ passo: 'resultados', dados: { sexo: 'masculino' } })
    expect(r.dados).toBeNull()
    expect(r.passo).toBe('dados')
  })

  it('descarta dados com altura zero ou não numérica', () => {
    expect(sanitizarEstado({ passo: 'resultados', dados: { ...dadosValidos, alturaCm: 0 } }).dados).toBeNull()
    expect(sanitizarEstado({ passo: 'resultados', dados: { ...dadosValidos, pesoKg: 'x' } }).dados).toBeNull()
    expect(sanitizarEstado({ passo: 'resultados', dados: { ...dadosValidos, atividade: 'maratona' } }).dados).toBeNull()
  })

  it('mantém cintura/quadril ausentes e remove os inválidos', () => {
    const semMedidas = { ...dadosValidos, cinturaCm: undefined, quadrilCm: undefined }
    expect(sanitizarEstado({ passo: 'resultados', dados: semMedidas }).dados).toEqual(semMedidas)
    const invalido = sanitizarEstado({ passo: 'resultados', dados: { ...dadosValidos, cinturaCm: -5 } }).dados
    expect(invalido?.cinturaCm).toBeUndefined()
    expect(invalido?.quadrilCm).toBe(100)
  })

  it('limita refeicaoAtual ao número de refeições', () => {
    expect(sanitizarEstado({ refeicaoAtual: 99 }).refeicaoAtual).toBe(REFEICOES.length - 1)
    expect(sanitizarEstado({ refeicaoAtual: -3 }).refeicaoAtual).toBe(0)
    expect(sanitizarEstado({ refeicaoAtual: 'abc' }).refeicaoAtual).toBe(0)
  })

  it('remove escolhas malformadas e de refeições desconhecidas', () => {
    const r = sanitizarEstado({
      escolhas: {
        cafe: { tipo: 'opcao', opcaoId: 'cafe-1' },
        almoco: { tipo: 'opcao' },
        jantar: 'x',
        sobremesa: { tipo: 'nao_faco' },
      },
    })
    expect(r.escolhas).toEqual({ cafe: { tipo: 'opcao', opcaoId: 'cafe-1' } })
  })

  it('cai para a equação padrão quando a salva é desconhecida', () => {
    expect(sanitizarEstado({ equacao: 'katch' }).equacao).toBe('mifflin')
  })
})

describe('reducer', () => {
  it('limita irParaRefeicao ao intervalo válido', () => {
    expect(reducer(ESTADO_INICIAL, { type: 'irParaRefeicao', indice: 99 }).refeicaoAtual).toBe(REFEICOES.length - 1)
    expect(reducer(ESTADO_INICIAL, { type: 'irParaRefeicao', indice: -1 }).refeicaoAtual).toBe(0)
  })

  it('novaAvaliacao zera tudo, inclusive a refeição atual', () => {
    const cheio = reducer(
      reducer({ ...ESTADO_INICIAL, dados: dadosValidos, passo: 'refeicoes' }, { type: 'irParaRefeicao', indice: 4 }),
      { type: 'escolher', refeicao: 'cafe', escolha: { tipo: 'nao_faco' } },
    )
    expect(reducer(cheio, { type: 'novaAvaliacao' })).toEqual(ESTADO_INICIAL)
  })
})
