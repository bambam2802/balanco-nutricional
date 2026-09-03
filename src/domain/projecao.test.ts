import { describe, expect, it } from 'vitest'
import { projetarPeso, KCAL_POR_KG } from './projecao'

describe('projetarPeso', () => {
  it('70kg, −500 kcal/dia, 12 semanas: delta = −500·84/7700 = −5.4545… → −5.5; final 64.5; 13 pontos; não acelerado', () => {
    const r = projetarPeso(70, -500, 12)

    expect(r.pontos).toHaveLength(13)
    expect(r.pontos[0]).toEqual({ semana: 0, pesoKg: 70 })

    const deltaBruto = (-500 * 84) / KCAL_POR_KG
    expect(deltaBruto).toBeCloseTo(-5.4545454545, 8)

    expect(r.deltaKg).toBe(-5.5)
    expect(r.pesoFinalKg).toBe(64.5)

    const ritmoEsperado = (-500 * 7) / KCAL_POR_KG
    expect(r.ritmoSemanalKg).toBeCloseTo(ritmoEsperado, 10)
    expect(r.ritmoSemanalKg).toBeCloseTo(-0.454545, 5)
    expect(r.ritmoAcelerado).toBe(false)
  })

  it('+1200 kcal/dia: ritmo = 1200·7/7700 = 1.0909… → acelerado (> 1 kg/semana)', () => {
    const r = projetarPeso(70, 1200, 4)
    expect(r.ritmoSemanalKg).toBeCloseTo(1.0909090909, 8)
    expect(r.ritmoAcelerado).toBe(true)
  })

  it('pontos intermediários não são arredondados', () => {
    const r = projetarPeso(70, -500, 12)
    const semana1 = r.pontos[1]
    expect(semana1.pesoKg).toBeCloseTo(70 + (-500 * 7 * 1) / KCAL_POR_KG, 10)
  })

  it('peso nunca fica abaixo de 0 (clamp)', () => {
    const r = projetarPeso(1, -50000, 10)
    for (const ponto of r.pontos) {
      expect(ponto.pesoKg).toBeGreaterThanOrEqual(0)
    }
  })

  it('balanço 0 → peso constante, ritmo 0, não acelerado', () => {
    const r = projetarPeso(70, 0, 5)
    expect(r.pesoFinalKg).toBe(70)
    expect(r.deltaKg).toBe(0)
    expect(r.ritmoSemanalKg).toBe(0)
    expect(r.ritmoAcelerado).toBe(false)
  })
})
