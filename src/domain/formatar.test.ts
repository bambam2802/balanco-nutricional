import { describe, expect, it } from 'vitest'
import { formatarKcal, formatarKg, formatarNumero, formatarSinal } from './formatar'

describe('formatarNumero', () => {
  it('2350 sem casas decimais → "2.350"', () => {
    expect(formatarNumero(2350)).toBe('2.350')
  })
  it('68.2 com 1 casa → "68,2"', () => {
    expect(formatarNumero(68.2, 1)).toBe('68,2')
  })
})

describe('formatarKcal', () => {
  it('2350 → "2.350 kcal"', () => {
    expect(formatarKcal(2350)).toBe('2.350 kcal')
  })
})

describe('formatarKg', () => {
  it('68.2 → "68,2 kg"', () => {
    expect(formatarKg(68.2)).toBe('68,2 kg')
  })
  it('respeita casas customizadas', () => {
    expect(formatarKg(68, 0)).toBe('68 kg')
  })
})

describe('formatarSinal', () => {
  it('250 → "+250"', () => {
    expect(formatarSinal(250)).toBe('+250')
  })
  it('−250 → "−250" (sinal de menos U+2212)', () => {
    expect(formatarSinal(-250)).toBe('−250')
  })
  it('0 → "0" (sem sinal)', () => {
    expect(formatarSinal(0)).toBe('0')
  })
  it('valor que arredonda para 0 → "0" (sem sinal)', () => {
    expect(formatarSinal(0.04)).toBe('0')
  })
})
