import { describe, expect, it } from 'vitest'
import { avaliarRiscoCV, calcularRCQ, classificarCintura, classificarRCQ } from './riscoCardio'
import type { DadosPessoa } from './types'

describe('classificarCintura — OMS', () => {
  it('mulher 79cm → normal', () => {
    expect(classificarCintura(79, 'feminino').nivel).toBe('normal')
  })
  it('mulher 80cm → aumentado', () => {
    expect(classificarCintura(80, 'feminino').nivel).toBe('aumentado')
  })
  it('mulher 88cm → muito_aumentado', () => {
    expect(classificarCintura(88, 'feminino').nivel).toBe('muito_aumentado')
  })
  it('homem 93cm → normal', () => {
    expect(classificarCintura(93, 'masculino').nivel).toBe('normal')
  })
  it('homem 94cm → aumentado', () => {
    expect(classificarCintura(94, 'masculino').nivel).toBe('aumentado')
  })
  it('homem 102cm → muito_aumentado', () => {
    expect(classificarCintura(102, 'masculino').nivel).toBe('muito_aumentado')
  })

  it('rótulos e cortes corretos', () => {
    const r = classificarCintura(80, 'feminino')
    expect(r.rotulo).toBe('Risco aumentado')
    expect(r.cortes).toEqual({ aumentado: 80, muitoAumentado: 88 })
  })
})

describe('calcularRCQ e classificarRCQ — OMS', () => {
  it('mulher 85/100 = 0.85 → sem risco (limite não é ultrapassado)', () => {
    const rcq = calcularRCQ(85, 100)
    expect(rcq).toBeCloseTo(0.85, 10)
    expect(classificarRCQ(rcq, 'feminino').risco).toBe(false)
  })

  it('mulher 86/100 = 0.86 → risco aumentado', () => {
    const rcq = calcularRCQ(86, 100)
    expect(classificarRCQ(rcq, 'feminino').risco).toBe(true)
    expect(classificarRCQ(rcq, 'feminino').rotulo).toBe('Risco aumentado')
  })

  it('homem 90/100 = 0.90 → sem risco', () => {
    const rcq = calcularRCQ(90, 100)
    expect(classificarRCQ(rcq, 'masculino').risco).toBe(false)
  })

  it('homem 91/100 = 0.91 → risco aumentado', () => {
    const rcq = calcularRCQ(91, 100)
    expect(classificarRCQ(rcq, 'masculino').risco).toBe(true)
  })
})

describe('avaliarRiscoCV', () => {
  const dadosBase: DadosPessoa = {
    sexo: 'feminino',
    idade: 30,
    pesoKg: 60,
    alturaCm: 165,
    atividade: 'sedentario',
  }

  it('sem cinturaCm → cintura e rcq null', () => {
    const r = avaliarRiscoCV(dadosBase)
    expect(r.cintura).toBeNull()
    expect(r.rcq).toBeNull()
  })

  it('com cinturaCm mas sem quadrilCm → cintura preenchida, rcq null', () => {
    const r = avaliarRiscoCV({ ...dadosBase, cinturaCm: 85 })
    expect(r.cintura).not.toBeNull()
    expect(r.rcq).toBeNull()
  })

  it('com cinturaCm e quadrilCm → ambos preenchidos', () => {
    const r = avaliarRiscoCV({ ...dadosBase, cinturaCm: 85, quadrilCm: 100 })
    expect(r.cintura).not.toBeNull()
    expect(r.rcq).not.toBeNull()
  })
})
