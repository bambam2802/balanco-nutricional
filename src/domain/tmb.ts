import type { DadosPessoa, Equacao, NivelAtividade, ResultadoVET } from './types'

/** Fatores de atividade física (multiplicadores do VET sobre a TMB). */
export const FATORES_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
}

/**
 * Calcula a TMB (Taxa Metabólica Basal) em kcal, sem arredondar.
 * - Mifflin-St Jeor: equação padrão para adultos.
 * - Harris-Benedict revisada 1984 (Roza & Shizgal).
 * - FAO/OMS 2004: usa só peso e faixa etária.
 */
export function calcularTMB(dados: DadosPessoa, equacao: Equacao): number {
  const { sexo, idade, pesoKg: P, alturaCm: A } = dados
  const I = idade

  if (equacao === 'mifflin') {
    const base = 10 * P + 6.25 * A - 5 * I
    return sexo === 'masculino' ? base + 5 : base - 161
  }

  if (equacao === 'harris') {
    return sexo === 'masculino'
      ? 88.362 + 13.397 * P + 4.799 * A - 5.677 * I
      : 447.593 + 9.247 * P + 3.098 * A - 4.33 * I
  }

  // FAO/OMS 2004 — faixas etárias, só peso. Idade < 10 usa a faixa 10–18.
  return calcularFaoOms(sexo, idade, P)
}

function calcularFaoOms(sexo: DadosPessoa['sexo'], idade: number, P: number): number {
  if (sexo === 'masculino') {
    if (idade < 18) return 17.686 * P + 658.2 // 10–18 (idade < 10 usa esta faixa)
    if (idade < 30) return 15.057 * P + 692.2 // 18–30
    if (idade < 60) return 11.472 * P + 873.1 // 30–60
    return 11.711 * P + 587.7 // ≥ 60
  }
  if (idade < 18) return 13.384 * P + 692.6 // 10–18 (idade < 10 usa esta faixa)
  if (idade < 30) return 14.818 * P + 486.6 // 18–30
  if (idade < 60) return 8.126 * P + 845.6 // 30–60
  return 9.082 * P + 658.5 // ≥ 60
}

/** Calcula o VET (Valor Energético Total) = TMB × fator de atividade. */
export function calcularVET(dados: DadosPessoa, equacao: Equacao): ResultadoVET {
  const tmb = calcularTMB(dados, equacao)
  const fator = FATORES_ATIVIDADE[dados.atividade]
  const vet = tmb * fator
  return {
    tmb: Math.round(tmb),
    fator,
    vet: Math.round(vet),
    equacao,
  }
}
