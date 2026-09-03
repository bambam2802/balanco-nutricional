import { describe, expect, it } from 'vitest'
import { calcularTMB, calcularVET, FATORES_ATIVIDADE } from './tmb'
import type { DadosPessoa } from './types'

const base = (overrides: Partial<DadosPessoa>): DadosPessoa => ({
  sexo: 'masculino',
  idade: 30,
  pesoKg: 70,
  alturaCm: 175,
  atividade: 'sedentario',
  ...overrides,
})

describe('calcularTMB — Mifflin-St Jeor', () => {
  it('homem 30a 70kg 175cm: 10·70+6.25·175−5·30+5 = 700+1093.75−150+5 = 1648.75 → 1649 (arredondado no VET)', () => {
    const dados = base({ sexo: 'masculino' })
    expect(calcularTMB(dados, 'mifflin')).toBeCloseTo(1648.75, 5)
    expect(calcularVET(dados, 'mifflin').tmb).toBe(1649)
  })

  it('mulher 30a 70kg 175cm: 700+1093.75−150−161 = 1482.75 → 1483', () => {
    const dados = base({ sexo: 'feminino' })
    expect(calcularTMB(dados, 'mifflin')).toBeCloseTo(1482.75, 5)
    expect(calcularVET(dados, 'mifflin').tmb).toBe(1483)
  })

  it('VET sedentário homem = 1648.75·1.2 = 1978.5 → 1979 (round)', () => {
    const dados = base({ sexo: 'masculino' })
    const resultado = calcularVET(dados, 'mifflin')
    expect(resultado.fator).toBe(FATORES_ATIVIDADE.sedentario)
    expect(resultado.vet).toBe(1979)
    expect(resultado.equacao).toBe('mifflin')
  })
})

describe('calcularTMB — Harris-Benedict revisada 1984 (Roza & Shizgal)', () => {
  it('homem 30a 70kg 175cm: 88.362+13.397·70+4.799·175−5.677·30 = 88.362+937.79+839.825−170.31 = 1695.667 → 1696', () => {
    const dados = base({ sexo: 'masculino' })
    expect(calcularTMB(dados, 'harris')).toBeCloseTo(1695.667, 2)
    expect(calcularVET(dados, 'harris').tmb).toBe(1696)
  })
})

describe('calcularTMB — FAO/OMS 2004', () => {
  it('homem 25a 70kg (faixa 18–30): 15.057·70+692.2 = 1746.19 → 1746', () => {
    const dados = base({ sexo: 'masculino', idade: 25, pesoKg: 70 })
    expect(calcularTMB(dados, 'fao')).toBeCloseTo(1746.19, 5)
    expect(calcularVET(dados, 'fao').tmb).toBe(1746)
  })

  it('mulher 65a 60kg (faixa ≥60): 9.082·60+658.5 = 1203.42 → 1203', () => {
    const dados = base({ sexo: 'feminino', idade: 65, pesoKg: 60 })
    expect(calcularTMB(dados, 'fao')).toBeCloseTo(1203.42, 5)
    expect(calcularVET(dados, 'fao').tmb).toBe(1203)
  })

  it('idade 18 exata cai na faixa 18–30 (homem)', () => {
    const dados18 = base({ sexo: 'masculino', idade: 18, pesoKg: 70 })
    const dados17 = base({ sexo: 'masculino', idade: 17, pesoKg: 70 })
    expect(calcularTMB(dados18, 'fao')).toBeCloseTo(15.057 * 70 + 692.2, 5)
    expect(calcularTMB(dados17, 'fao')).toBeCloseTo(17.686 * 70 + 658.2, 5)
  })

  it('idade 30 exata cai na faixa 30–60 (mulher)', () => {
    const dados30 = base({ sexo: 'feminino', idade: 30, pesoKg: 60 })
    const dados29 = base({ sexo: 'feminino', idade: 29, pesoKg: 60 })
    expect(calcularTMB(dados30, 'fao')).toBeCloseTo(8.126 * 60 + 845.6, 5)
    expect(calcularTMB(dados29, 'fao')).toBeCloseTo(14.818 * 60 + 486.6, 5)
  })

  it('idade 60 exata cai na faixa ≥60 (homem)', () => {
    const dados60 = base({ sexo: 'masculino', idade: 60, pesoKg: 70 })
    const dados59 = base({ sexo: 'masculino', idade: 59, pesoKg: 70 })
    expect(calcularTMB(dados60, 'fao')).toBeCloseTo(11.711 * 70 + 587.7, 5)
    expect(calcularTMB(dados59, 'fao')).toBeCloseTo(11.472 * 70 + 873.1, 5)
  })

  it('idade < 10 usa a faixa 10–18 (não lança erro)', () => {
    const dados = base({ sexo: 'masculino', idade: 8, pesoKg: 30 })
    expect(() => calcularTMB(dados, 'fao')).not.toThrow()
    expect(calcularTMB(dados, 'fao')).toBeCloseTo(17.686 * 30 + 658.2, 5)
  })
})
