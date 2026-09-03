import type { PontoProjecao, Sexo } from './types'

/**
 * Modelo dinâmico de peso de Hall et al. (Lancet 2011), o mesmo usado pelo
 * Body Weight Planner do NIDDK (niddk.nih.gov/bwp). Diferente da regra linear
 * (7700 kcal = 1 kg), simula dia a dia a partição da energia entre massa
 * gorda (F), massa magra (L), glicogênio (G) e água extracelular (ECW),
 * integrando por Runge-Kutta de 4ª ordem com passo de 1 dia — reproduzindo
 * `BodyModel.RungeKatta` do JS original (cópia em scratchpad/bwp/).
 */

// --- Constantes do modelo (Hall et al. 2011 / planner do NIDDK) ---

/** Densidade energética da massa gorda e magra, kcal/kg. */
const RHO_F = 9440
const RHO_L = 1807
/** Densidade energética do glicogênio, kcal/kg (usada no fluxo de carboidrato). */
const RHO_G = 4180

/** Coeficientes de gasto energético ligados à massa magra e gorda, kcal/kg/d. */
const GAMMA_L = 22
const GAMMA_F = 3.2

/** Coeficientes de eficiência metabólica usados no cálculo do TEE. */
const ETA_F = 180
const ETA_L = 230

/** Constante de Forbes: C = 10,4·ρL/ρF ≈ 1,9908 kg (partição F/L da perda/ganho). */
const FORBES_C = (10.4 * RHO_L) / RHO_F

/** Termogênese adaptativa: fração da ingestão e constante de tempo (dias). */
const FRACAO_TERMOGENESE = 0.14
const TAU_TERMOGENESE_DIAS = 14

/** TEF (efeito térmico do alimento): fração da ingestão. */
const FRACAO_TEF = 0.1

/** Glicogênio inicial (kg) e água ligada por kg de glicogênio. */
const GLICOGENIO_INICIAL_KG = 0.5
const AGUA_POR_KG_GLICOGENIO = 3.7

/** % de carboidrato na ingestão (constante no planner, sem intervenção de macros). */
const CARB_PCT = 50

/** Sódio basal (mg/d) e parâmetros do balanço de sódio → água extracelular. */
const SODIO_INICIAL_MG = 4000
const NA_TAXA_BALANCO = 3000
const NA_EXTRA = 4000
const NA_CONCENTRACAO = 3220

/** Ritmo acima do qual a perda/ganho semanal é considerada acelerada. */
const RITMO_MAXIMO_KG_SEMANA = 1

// --- Contratos (T1) ---

export interface EntradaHall {
  sexo: Sexo
  idade: number
  pesoKg: number
  alturaCm: number
  /** TMB (RMR) da equação escolhida no app. */
  tmbKcal: number
  /** Ingestão de manutenção (VET) do baseline. */
  vetKcal: number
  /** % de gordura corporal medida; sem ela, estimamos por Jackson 2002. */
  gorduraPct?: number
}

export interface PontoHall {
  dia: number
  pesoKg: number
  gorduraKg: number
  gorduraPct: number
  gastoKcal: number
}

export interface ProjecaoHall {
  /** Pontos semanais (dia 0, 7, 14, …), compatíveis com o gráfico de projeção. */
  pontos: PontoProjecao[]
  diarios: PontoHall[]
  pesoFinalKg: number
  deltaKg: number
  gorduraPctInicial: number
  gorduraPctFinal: number
  /** Ritmo médio no horizonte (delta/semanas). */
  ritmoSemanalKg: number
  ritmoAcelerado: boolean
}

export interface ResultadoMeta {
  alcancavel: boolean
  /** Ingestão diária para chegar ao peso-alvo no prazo. */
  kcalDia: number | null
  /** Ingestão de manutenção no peso-alvo (após alcançá-lo). */
  kcalManterAlvo: number | null
  abaixoSeguro: boolean
  pesoNoPrazoKg: number | null
}

/** Baseline do modelo de Hall — equivalente ao `Baseline` do planner, calculado uma vez. */
export interface BaselineHall {
  sexo: Sexo
  idade: number
  pesoKg: number
  alturaCm: number
  tmbKcal: number
  vetKcal: number
  gorduraPctInicial: number
  fatKg0: number
  leanKg0: number
  /** δ — parâmetro de atividade: (0,9·VET − TMB)/peso (`Baseline.getActivityParam`). */
  deltaAtividade: number
  /** K — constante de balanço do baseline (`Baseline.getK`). */
  k: number
  /** Termogênese adaptativa inicial = 0,14·VET (`Baseline.getTherm`). */
  thermKcal0: number
}

/** Estado diário do corpo (F, L, G, ΔECW, termogênese) — equivalente ao `BodyModel`. */
interface EstadoCorporal {
  fat: number
  lean: number
  glycogen: number
  decw: number
  therm: number
}

// --- Composição corporal ---

/**
 * % de gordura corporal por Jackson 2002 (usada pelo planner quando não há
 * bioimpedância/adipômetro). Clamp 0–60%, como `Baseline.getBFP`.
 */
export function estimarGorduraPct(sexo: Sexo, idade: number, imc: number): number {
  const bruto =
    sexo === 'masculino'
      ? 0.14 * idade + 37.31 * Math.log(imc) - 103.94
      : 0.14 * idade + 39.96 * Math.log(imc) - 102.01

  return Math.min(60, Math.max(0, bruto))
}

/**
 * Monta o baseline de Hall a partir dos dados já calculados pelo app
 * (TMB da equação escolhida, VET = TMB × fator de atividade).
 */
export function criarBaseline(e: EntradaHall): BaselineHall {
  const imc = e.pesoKg / (e.alturaCm / 100) ** 2
  const gorduraPctBruta = e.gorduraPct ?? estimarGorduraPct(e.sexo, e.idade, imc)
  // Mesmo clamp do construtor de `Baseline` (MIN_BFP/MAX_BFP = 0/100) para % informada manualmente.
  const gorduraPctInicial = Math.min(100, Math.max(0, gorduraPctBruta))

  const fatKg0 = (e.pesoKg * gorduraPctInicial) / 100
  const leanKg0 = e.pesoKg - fatKg0

  // δ = (0,9·VET − TMB)/peso (`Baseline.getActivityParam`, com getMaintCals() = VET).
  const deltaAtividade = (0.9 * e.vetKcal - e.tmbKcal) / e.pesoKg
  // K = 0,76·VET − 22·L0 − 3,2·F0 − δ·peso (`Baseline.getK`, delta_E do planner sempre 0).
  const k = 0.76 * e.vetKcal - GAMMA_L * leanKg0 - GAMMA_F * fatKg0 - deltaAtividade * e.pesoKg
  const thermKcal0 = FRACAO_TERMOGENESE * e.vetKcal

  return {
    sexo: e.sexo,
    idade: e.idade,
    pesoKg: e.pesoKg,
    alturaCm: e.alturaCm,
    tmbKcal: e.tmbKcal,
    vetKcal: e.vetKcal,
    gorduraPctInicial,
    fatKg0,
    leanKg0,
    deltaAtividade,
    k,
    thermKcal0,
  }
}

function estadoInicial(b: BaselineHall): EstadoCorporal {
  return {
    fat: b.fatKg0,
    lean: b.leanKg0,
    glycogen: GLICOGENIO_INICIAL_KG,
    decw: 0,
    therm: b.thermKcal0,
  }
}

/** Peso total = F + L + 3,7·(G − G0) + ΔECW (`BodyModel.getWeight`). */
function pesoDoEstado(estado: EstadoCorporal): number {
  return (
    estado.fat + estado.lean + AGUA_POR_KG_GLICOGENIO * (estado.glycogen - GLICOGENIO_INICIAL_KG) + estado.decw
  )
}

/** p de Forbes: fração da variação de energia alocada à massa magra (`BodyModel.getp`). */
function forbesP(fatKg: number): number {
  return FORBES_C / (FORBES_C + fatKg)
}

/** Ingestão de carboidrato-alvo do baseline (constante = 50% do VET, `Baseline.getCarbsIn`). */
function carboAlvoBaseline(b: BaselineHall): number {
  return (CARB_PCT / 100) * b.vetKcal
}

/** Fluxo líquido de carboidrato (`BodyModel.carbflux`). */
function fluxoCarbo(estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): number {
  const carbIntakeAtual = (CARB_PCT / 100) * ingestaoKcalDia
  const kCarb = carboAlvoBaseline(b) / GLICOGENIO_INICIAL_KG ** 2
  return carbIntakeAtual - kCarb * estado.glycogen ** 2
}

/** Sódio proporcional à ingestão do dia (`Baseline.proportionalSodium`). */
function sodioProporcional(b: BaselineHall, ingestaoKcalDia: number): number {
  return (SODIO_INICIAL_MG * ingestaoKcalDia) / b.vetKcal
}

/** Desbalanço de sódio → variação de ΔECW (`BodyModel.Na_imbal`). */
function desbalancoSodio(estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): number {
  const sodioHoje = sodioProporcional(b, ingestaoKcalDia)
  const carbIntakeAtual = (CARB_PCT / 100) * ingestaoKcalDia
  const carbIntakeBase = carboAlvoBaseline(b)
  return sodioHoje - SODIO_INICIAL_MG - NA_TAXA_BALANCO * estado.decw - NA_EXTRA * (1 - carbIntakeAtual / carbIntakeBase)
}

/** Gasto energético total do dia — TEE (`BodyModel.getTEE`/`getExpend`). */
function calcularTEE(estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): number {
  const p = forbesP(estado.fat)
  const cf = fluxoCarbo(estado, b, ingestaoKcalDia)
  const tef = FRACAO_TEF * ingestaoKcalDia
  const pesoAtual = pesoDoEstado(estado)

  // `DailyParams` do planner clampa actparam em ≥ 0 só no laço diário (não em K nem em cals4balance).
  const deltaDia = Math.max(0, b.deltaAtividade)
  const expend = b.k + GAMMA_L * estado.lean + GAMMA_F * estado.fat + deltaDia * pesoAtual + estado.therm + tef

  const numerador = (1 - p) * (ETA_F / RHO_F) + p * (ETA_L / RHO_L)
  const denominador = 1 + p * (ETA_L / RHO_L) + (1 - p) * (ETA_F / RHO_F)

  return (expend + (ingestaoKcalDia - cf) * numerador) / denominador
}

/** Derivadas diárias (F, L, G, ΔECW, termogênese) — `BodyModel.dt`. */
function derivadas(estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): EstadoCorporal {
  const p = forbesP(estado.fat)
  const cf = fluxoCarbo(estado, b, ingestaoKcalDia)
  const tee = calcularTEE(estado, b, ingestaoKcalDia)
  const excedente = ingestaoKcalDia - tee - cf

  return {
    fat: ((1 - p) * excedente) / RHO_F,
    lean: (p * excedente) / RHO_L,
    glycogen: cf / RHO_G,
    decw: desbalancoSodio(estado, b, ingestaoKcalDia) / NA_CONCENTRACAO,
    therm: (FRACAO_TERMOGENESE * ingestaoKcalDia - estado.therm) / TAU_TERMOGENESE_DIAS,
  }
}

function somarEstado(estado: EstadoCorporal, variacao: EstadoCorporal, passo: number): EstadoCorporal {
  return {
    fat: estado.fat + passo * variacao.fat,
    lean: estado.lean + passo * variacao.lean,
    glycogen: estado.glycogen + passo * variacao.glycogen,
    decw: estado.decw + passo * variacao.decw,
    therm: estado.therm + passo * variacao.therm,
  }
}

function mediaPonderada(variacoes: EstadoCorporal[], pesos: number[]): EstadoCorporal {
  const somaPesos = pesos.reduce((s, w) => s + w, 0)
  const acc: EstadoCorporal = { fat: 0, lean: 0, glycogen: 0, decw: 0, therm: 0 }

  for (let i = 0; i < variacoes.length; i++) {
    const w = pesos[i]
    acc.fat += w * variacoes[i].fat
    acc.lean += w * variacoes[i].lean
    acc.glycogen += w * variacoes[i].glycogen
    acc.decw += w * variacoes[i].decw
    acc.therm += w * variacoes[i].therm
  }

  return {
    fat: acc.fat / somaPesos,
    lean: acc.lean / somaPesos,
    glycogen: acc.glycogen / somaPesos,
    decw: acc.decw / somaPesos,
    therm: acc.therm / somaPesos,
  }
}

/**
 * Um passo de 1 dia por Runge-Kutta de 4ª ordem, exatamente na mesma ordem
 * de operações de `BodyModel.RungeKatta` (pesos [1, 2, 2, 1] / 6).
 */
function passoRungeKutta(estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): EstadoCorporal {
  const dt1 = derivadas(estado, b, ingestaoKcalDia)
  const e2 = somarEstado(estado, dt1, 0.5)
  const dt2 = derivadas(e2, b, ingestaoKcalDia)
  const e3 = somarEstado(estado, dt2, 0.5)
  const dt3 = derivadas(e3, b, ingestaoKcalDia)
  const e4 = somarEstado(estado, dt3, 1.0)
  const dt4 = derivadas(e4, b, ingestaoKcalDia)

  const media = mediaPonderada([dt1, dt2, dt3, dt4], [1, 2, 2, 1])
  return somarEstado(estado, media, 1.0)
}

function pontoDoEstado(dia: number, estado: EstadoCorporal, b: BaselineHall, ingestaoKcalDia: number): PontoHall {
  // Exibição com piso em 0: ingestão quase nula por meses leva o modelo a valores sem sentido físico.
  const pesoKg = Math.max(0, pesoDoEstado(estado))
  const gorduraKg = Math.max(0, estado.fat)
  return {
    dia,
    pesoKg,
    gorduraKg,
    gorduraPct: pesoKg > 0 ? Math.min(100, (gorduraKg / pesoKg) * 100) : 0,
    gastoKcal: calcularTEE(estado, b, ingestaoKcalDia),
  }
}

function rodarDias(b: BaselineHall, ingestaoKcalDia: number, dias: number): EstadoCorporal {
  let estado = estadoInicial(b)
  for (let dia = 1; dia <= dias; dia++) {
    estado = passoRungeKutta(estado, b, ingestaoKcalDia)
  }
  return estado
}

/**
 * Simula dia a dia (dia 0 = baseline, sem intervenção, até `dias`) com
 * ingestão diária constante. Equivalente a `BodyModel.projectFromBaseline`
 * amostrado em todos os dias intermediários.
 */
export function simularHall(b: BaselineHall, ingestaoKcalDia: number, dias: number): PontoHall[] {
  const pontos: PontoHall[] = []
  let estado = estadoInicial(b)
  pontos.push(pontoDoEstado(0, estado, b, ingestaoKcalDia))

  for (let dia = 1; dia <= dias; dia++) {
    estado = passoRungeKutta(estado, b, ingestaoKcalDia)
    pontos.push(pontoDoEstado(dia, estado, b, ingestaoKcalDia))
  }

  return pontos
}

/** Projeta o peso pelo modelo de Hall ao longo de `semanas`, com ingestão diária constante. */
export function projetarPesoHall(e: EntradaHall, ingestaoKcalDia: number, semanas: number): ProjecaoHall {
  const b = criarBaseline(e)
  const dias = 7 * semanas
  const diarios = simularHall(b, ingestaoKcalDia, dias)

  const pontos: PontoProjecao[] = diarios
    .filter((p) => p.dia % 7 === 0)
    .map((p) => ({ semana: p.dia / 7, pesoKg: p.pesoKg }))

  const inicial = diarios[0]
  const final = diarios[diarios.length - 1]
  const deltaKg = final.pesoKg - inicial.pesoKg
  const ritmoSemanalKg = semanas > 0 ? deltaKg / semanas : 0

  return {
    pontos,
    diarios,
    pesoFinalKg: final.pesoKg,
    deltaKg,
    gorduraPctInicial: inicial.gorduraPct,
    gorduraPctFinal: final.gorduraPct,
    ritmoSemanalKg,
    ritmoAcelerado: Math.abs(ritmoSemanalKg) > RITMO_MAXIMO_KG_SEMANA,
  }
}

/**
 * Ingestão de manutenção para um estado corporal já alcançado, com o δ do
 * baseline (`BodyModel.cals4balance`) — usada como `kcalManterAlvo`.
 */
function calsParaBalanco(estado: EstadoCorporal, b: BaselineHall, atividade: number): number {
  const peso = pesoDoEstado(estado)
  const expendSemComida = b.k + GAMMA_L * estado.lean + GAMMA_F * estado.fat + atividade * peso
  const p = forbesP(estado.fat)
  const pDenominador = 1 + p * (ETA_L / RHO_L) + (1 - p) * (ETA_F / RHO_F)
  const pNumerador = (1 - p) * (ETA_F / RHO_F) + p * (ETA_L / RHO_L)
  return expendSemComida / (pDenominador - pNumerador - 0.24)
}

const META_EPS_KG = 0.001
const META_PASSO_INICIAL_KCAL = 200
const META_MAX_ITERACOES = 200
const META_KCAL_SEGURO_MIN = 1000

/**
 * Ingestão diária necessária para alcançar `pesoAlvoKg` em `semanas`, por
 * bissecção — tradução de `Intervention.forgoal` (passo 200 kcal a partir de
 * 0, tolerância 0,001 kg).
 */
export function caloriasParaMeta(e: EntradaHall, pesoAlvoKg: number, semanas: number): ResultadoMeta {
  const inalcancavel: ResultadoMeta = {
    alcancavel: false,
    kcalDia: null,
    kcalManterAlvo: null,
    abaixoSeguro: false,
    pesoNoPrazoKg: null,
  }

  if (pesoAlvoKg <= 0 || semanas <= 0) return inalcancavel

  const b = criarBaseline(e)
  const dias = 7 * semanas

  // Alvo == peso atual: mantém a ingestão de manutenção (mesmo atalho de `Intervention.forgoal`).
  if (e.pesoKg === pesoAlvoKg) {
    const kcalDia = b.vetKcal
    const estadoFinal = rodarDias(b, kcalDia, dias)
    return {
      alcancavel: true,
      kcalDia,
      kcalManterAlvo: calsParaBalanco(estadoFinal, b, b.deltaAtividade),
      abaixoSeguro: kcalDia < META_KCAL_SEGURO_MIN,
      pesoNoPrazoKg: pesoDoEstado(estadoFinal),
    }
  }

  // Teste de "fome" (0 kcal): limite inferior de peso alcançável no prazo.
  const estadoFome = rodarDias(b, 0, dias)
  const pesoFomeBruto = pesoDoEstado(estadoFome)
  const pesoFome = pesoFomeBruto < 0 ? 0 : pesoFomeBruto
  let erro = Math.abs(pesoFome - pesoAlvoKg)

  if (erro < META_EPS_KG || pesoAlvoKg <= pesoFome) {
    // Nem comendo 0 kcal o alvo é alcançado no prazo.
    return { ...inalcancavel, pesoNoPrazoKg: pesoFome }
  }

  let checkCals = 0
  let calStep = META_PASSO_INICIAL_KCAL
  let holdCals = 0
  let pesoTeste = pesoFome
  let iteracoes = 0
  let pcxErro = 0

  do {
    iteracoes++
    holdCals = checkCals
    checkCals += calStep

    const estadoTeste = rodarDias(b, checkCals, dias)
    pesoTeste = pesoDoEstado(estadoTeste)

    if (pesoTeste < 0) {
      pcxErro++
      if (pcxErro > 10) return { ...inalcancavel, pesoNoPrazoKg: pesoTeste }
    }

    erro = Math.abs(pesoAlvoKg - pesoTeste)

    if (erro > META_EPS_KG && pesoTeste > pesoAlvoKg) {
      calStep /= 2
      checkCals = holdCals
    }
  } while (erro > META_EPS_KG && iteracoes < META_MAX_ITERACOES)

  const kcalDia = checkCals
  const estadoFinal = rodarDias(b, kcalDia, dias)
  const pesoNoPrazoKg = pesoDoEstado(estadoFinal)

  return {
    alcancavel: erro <= META_EPS_KG,
    kcalDia,
    kcalManterAlvo: calsParaBalanco(estadoFinal, b, b.deltaAtividade),
    abaixoSeguro: kcalDia < META_KCAL_SEGURO_MIN,
    pesoNoPrazoKg,
  }
}
