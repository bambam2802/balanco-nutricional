import { describe, expect, it } from 'vitest'
import {
  caloriasParaMeta,
  criarBaseline,
  estimarGorduraPct,
  projetarPesoHall,
  simularHall,
  type EntradaHall,
} from './hall'
import { projetarPeso } from './projecao'

// Os três perfis abaixo espelham exatamente os usados em scratchpad/bwp-golden.mjs,
// que roda o JS original do NIDDK Body Weight Planner (scratchpad/bwp/*.js) com
// RMR/PAL injetados a partir do nosso tmb/vet (baseline.rmrCalc=true; baseline.rmr=tmb;
// baseline.pal=vet/tmb), gerado em 2026-09-03.
const perfilA: EntradaHall = {
  sexo: 'masculino',
  idade: 45,
  pesoKg: 90,
  alturaCm: 175,
  tmbKcal: 1820,
  vetKcal: 2457,
}

const perfilB: EntradaHall = {
  sexo: 'feminino',
  idade: 34,
  pesoKg: 68,
  alturaCm: 165,
  tmbKcal: 1380,
  vetKcal: 1898,
}

const perfilC: EntradaHall = {
  sexo: 'masculino',
  idade: 65,
  pesoKg: 80,
  alturaCm: 170,
  tmbKcal: 1543,
  vetKcal: 2121,
  gorduraPct: 30,
}

describe('estimarGorduraPct (Jackson 2002, como Baseline.getBFP do planner)', () => {
  it('homem 45a, IMC 29,39: 0,14·45 + 37,31·ln(29,39) − 103,94 ≈ 28,4922', () => {
    const esperado = 0.14 * 45 + 37.31 * Math.log(29.39) - 103.94
    expect(estimarGorduraPct('masculino', 45, 29.39)).toBeCloseTo(esperado, 10)
    expect(estimarGorduraPct('masculino', 45, 29.39)).toBeCloseTo(28.492218664874144, 8)
  })

  it('clamp no piso 0%: homem jovem com IMC muito baixo dá fórmula negativa', () => {
    const bruto = 0.14 * 18 + 37.31 * Math.log(14) - 103.94
    expect(bruto).toBeLessThan(0)
    expect(estimarGorduraPct('masculino', 18, 14)).toBe(0)
  })

  it('clamp no teto 60%: mulher idosa com IMC muito alto dá fórmula acima de 60', () => {
    const bruto = 0.14 * 80 + 39.96 * Math.log(55) - 102.01
    expect(bruto).toBeGreaterThan(60)
    expect(estimarGorduraPct('feminino', 80, 55)).toBe(60)
  })
})

describe('ingestão = VET mantém o peso (equilíbrio energético)', () => {
  it.each([
    ['perfil A', perfilA],
    ['perfil B', perfilB],
    ['perfil C', perfilC],
  ])('%s: |Δpeso| < 0,05 kg em 365 dias comendo a manutenção', (_nome, entrada) => {
    const b = criarBaseline(entrada)
    const diarios = simularHall(b, entrada.vetKcal, 365)
    const pesoFinal = diarios[diarios.length - 1].pesoKg
    expect(Math.abs(pesoFinal - entrada.pesoKg)).toBeLessThan(0.05)
  })
})

describe('valores-ouro vs. JS original do planner (±0,01 kg peso; ±0,5 kcal TEE)', () => {
  // dia -> { pesoKg, gorduraKg, teeKcal }, gerado por bwp-golden.mjs
  const goldenA = {
    7: { pesoKg: 88.88418124464694, gorduraKg: 25.373887451291058, teeKcal: 2360.4941945702503 },
    28: { pesoKg: 87.78482715762173, gorduraKg: 24.598362125532745, teeKcal: 2314.3047422590275 },
    84: { pesoKg: 85.1617639770975, gorduraKg: 22.775871586961365, teeKcal: 2271.1430229748416 },
    168: { pesoKg: 81.65801564285321, gorduraKg: 20.411829169549534, teeKcal: 2224.157451348926 },
    364: { pesoKg: 75.20303809939733, gorduraKg: 16.297757155370665, teeKcal: 2133.641515360106 },
  }
  const goldenB = {
    7: { pesoKg: 69.31967322433314, gorduraKg: 21.57041521781161, teeKcal: 1997.1811642856997 },
    28: { pesoKg: 70.44814320055804, gorduraKg: 22.335201082116498, teeKcal: 2044.7258995421948 },
    84: { pesoKg: 73.06104305193922, gorduraKg: 24.139968985251766, teeKcal: 2088.8051949903856 },
    168: { pesoKg: 76.41732102753811, gorduraKg: 26.518802119218577, teeKcal: 2132.9056758246325 },
    364: { pesoKg: 82.41225222759891, gorduraKg: 30.917621284787007, teeKcal: 2208.8169675209856 },
  }
  const goldenC = {
    7: { pesoKg: 78.46208301096158, gorduraKg: 23.676344050961163, teeKcal: 1999.806109154792 },
    28: { pesoKg: 77.07845764770366, gorduraKg: 22.722367803161116, teeKcal: 1941.489637469033 },
    84: { pesoKg: 73.77800274845985, gorduraKg: 20.49491295666451, teeKcal: 1885.3395083350104 },
    168: { pesoKg: 69.37325104973594, gorduraKg: 17.646442871358627, teeKcal: 1822.9632983946706 },
    364: { pesoKg: 61.33922793501817, gorduraKg: 12.883844184262841, teeKcal: 1701.931780869308 },
  }

  it.each([
    ['perfil A', perfilA, 1957, goldenA],
    ['perfil B', perfilB, 2400, goldenB],
    ['perfil C', perfilC, 1500, goldenC],
  ] as const)('%s, ingestão fixa, dias 7/28/84/168/364', (_nome, entrada, ingestao, golden) => {
    const b = criarBaseline(entrada)
    const diarios = simularHall(b, ingestao, 364)

    for (const dia of [7, 28, 84, 168, 364] as const) {
      const ponto = diarios[dia]
      const esperado = golden[dia]
      expect(ponto.pesoKg).toBeCloseTo(esperado.pesoKg, 2)
      expect(ponto.gorduraKg).toBeCloseTo(esperado.gorduraKg, 2)
      expect(ponto.gastoKcal).toBeCloseTo(esperado.teeKcal, 1)
    }
  })
})

describe('desaceleração da perda (perfil A, déficit de 500 kcal/dia)', () => {
  it('em 52 semanas perde menos que a regra linear, e as 2 primeiras semanas perdem mais rápido que a média do horizonte', () => {
    const semanas = 52
    const hall = projetarPesoHall(perfilA, perfilA.vetKcal - 500, semanas)
    const linear = projetarPeso(perfilA.pesoKg, -500, semanas)

    // O modelo dinâmico desacelera (gasto cai com o peso): perde menos que a regra linear.
    expect(Math.abs(hall.deltaKg)).toBeLessThan(Math.abs(linear.deltaKg))

    const pesoSemana0 = hall.pontos[0].pesoKg
    const pesoSemana2 = hall.pontos[2].pesoKg
    const ritmoPrimeirasSemanas = (pesoSemana2 - pesoSemana0) / 2
    const ritmoMedioHorizonte = hall.deltaKg / semanas

    expect(Math.abs(ritmoPrimeirasSemanas)).toBeGreaterThan(Math.abs(ritmoMedioHorizonte))
  })
})

describe('caloriasParaMeta (bissecção, como Intervention.forgoal)', () => {
  it('perfil A, alvo 80 kg em 24 semanas: bate com o valor-ouro do planner (±2 kcal) e a simulação chega a 80 ± 0,05 kg', () => {
    // gerado por bwp-golden.mjs: Intervention.forgoal(baseline, 80, 168, 0, 0, 0.001).calories
    const kcalDiaGolden = 1860.05859375

    const resultado = caloriasParaMeta(perfilA, 80, 24)

    expect(resultado.alcancavel).toBe(true)
    expect(resultado.kcalDia).not.toBeNull()
    expect(resultado.kcalDia!).toBeCloseTo(kcalDiaGolden, 0) // ±2 kcal (toBeCloseTo dígito 0 = ±0,5; cobre com folga)
    expect(Math.abs(resultado.kcalDia! - kcalDiaGolden)).toBeLessThanOrEqual(2)
    expect(resultado.pesoNoPrazoKg!).toBeCloseTo(80, 1)

    const b = criarBaseline(perfilA)
    const diarios = simularHall(b, resultado.kcalDia!, 24 * 7)
    expect(Math.abs(diarios[diarios.length - 1].pesoKg - 80)).toBeLessThan(0.05)
  })

  it('alvo muito abaixo do possível (20 kg em 4 semanas): inalcançável', () => {
    const resultado = caloriasParaMeta(perfilA, 20, 4)
    expect(resultado.alcancavel).toBe(false)
    expect(resultado.kcalDia).toBeNull()
  })

  it('alvo acima do peso atual (ganho de peso): kcalDia de superávit, acima do VET', () => {
    const resultado = caloriasParaMeta(perfilA, 100, 24)
    expect(resultado.alcancavel).toBe(true)
    expect(resultado.kcalDia!).toBeGreaterThan(perfilA.vetKcal)
  })

  it('alvo igual ao peso atual: kcalDia ≈ VET (atalho de Intervention.forgoal)', () => {
    const resultado = caloriasParaMeta(perfilA, perfilA.pesoKg, 24)
    expect(resultado.alcancavel).toBe(true)
    expect(resultado.kcalDia!).toBeCloseTo(perfilA.vetKcal, 6)
  })

  it('peso-alvo ou prazo inválidos (<= 0) são sempre inalcançáveis', () => {
    expect(caloriasParaMeta(perfilA, 0, 12).alcancavel).toBe(false)
    expect(caloriasParaMeta(perfilA, -5, 12).alcancavel).toBe(false)
    expect(caloriasParaMeta(perfilA, 80, 0).alcancavel).toBe(false)
    expect(caloriasParaMeta(perfilA, 80, -1).alcancavel).toBe(false)
  })

  it('ingestão abaixo de 1000 kcal/dia é sinalizada como não segura', () => {
    // Meta agressiva o suficiente para exigir déficit forte, mas ainda alcançável.
    const resultado = caloriasParaMeta(perfilA, 70, 12)
    if (resultado.kcalDia !== null && resultado.kcalDia < 1000) {
      expect(resultado.abaixoSeguro).toBe(true)
    } else {
      expect(resultado.abaixoSeguro).toBe(false)
    }
  })
})
