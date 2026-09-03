import { describe, expect, it } from 'vitest'
import { calcularIMC, classificarIMC, FAIXAS_IMC_ADULTO, FAIXAS_IMC_IDOSO } from './imc'

describe('calcularIMC', () => {
  it('70kg 175cm: 70 / 1.75² = 22.857142857…', () => {
    expect(calcularIMC(70, 175)).toBeCloseTo(22.857142857, 8)
  })
})

describe('classificarIMC — adulto (OMS)', () => {
  const casos: Array<[number, string]> = [
    [18.4, 'baixo_peso'],
    [18.5, 'eutrofia'],
    [24.9, 'eutrofia'],
    [25, 'sobrepeso'],
    [29.9, 'sobrepeso'],
    [30, 'obesidade_1'],
    [34.9, 'obesidade_1'],
    [35, 'obesidade_2'],
    [39.9, 'obesidade_2'],
    [40, 'obesidade_3'],
  ]

  it.each(casos)('imc %s → %s', (imc, esperado) => {
    const resultado = classificarIMC(imc, 30)
    expect(resultado.classificacao).toBe(esperado)
    expect(resultado.protocolo).toBe('oms_adulto')
    expect(resultado.faixas).toBe(FAIXAS_IMC_ADULTO)
  })
})

describe('classificarIMC — idoso (Lipschitz 1994)', () => {
  it('65 anos, imc 21.9 → baixo_peso', () => {
    const r = classificarIMC(21.9, 65)
    expect(r.classificacao).toBe('baixo_peso')
    expect(r.protocolo).toBe('lipschitz_idoso')
    expect(r.faixas).toBe(FAIXAS_IMC_IDOSO)
  })

  it('65 anos, imc 22 → eutrofia (limite inferior inclusivo)', () => {
    expect(classificarIMC(22, 65).classificacao).toBe('eutrofia')
  })

  it('65 anos, imc 27 → eutrofia (27,0 ainda é eutrofia)', () => {
    expect(classificarIMC(27, 65).classificacao).toBe('eutrofia')
  })

  it('65 anos, imc 27.1 → sobrepeso (só acima de 27 é sobrepeso)', () => {
    expect(classificarIMC(27.1, 65).classificacao).toBe('sobrepeso')
  })

  it('idade 60 exata já usa o protocolo idoso', () => {
    expect(classificarIMC(23, 60).protocolo).toBe('lipschitz_idoso')
  })
})

describe('classificarIMC — menor de 18 anos', () => {
  it('17 anos → sem_classificacao, protocolo nenhum, faixas vazias', () => {
    const r = classificarIMC(22, 17)
    expect(r.classificacao).toBe('sem_classificacao')
    expect(r.protocolo).toBe('nenhum')
    expect(r.faixas).toEqual([])
  })
})
