import type { PontoProjecao, Projecao } from './types'

/** 1 kg de tecido adiposo ≈ 7700 kcal. */
export const KCAL_POR_KG = 7700

/** Ritmo de emagrecimento/ganho recomendado como limite superior seguro. */
export const RITMO_MAXIMO_KG_SEMANA = 1

/**
 * Projeta a evolução do peso ao longo de `semanas`, assumindo balanço
 * calórico diário constante. Linear: 7700 kcal = 1 kg (regra clássica).
 * Peso nunca fica abaixo de 0 (clamp de segurança).
 */
export function projetarPeso(
  pesoAtualKg: number,
  balancoDiarioKcal: number,
  semanas: number,
): Projecao {
  const pontos: PontoProjecao[] = []

  for (let semana = 0; semana <= semanas; semana++) {
    const pesoKg = Math.max(0, pesoAtualKg + (balancoDiarioKcal * 7 * semana) / KCAL_POR_KG)
    pontos.push({ semana, pesoKg })
  }

  const pesoFinalBruto = pontos[pontos.length - 1].pesoKg
  const pesoFinalKg = Math.round(pesoFinalBruto * 10) / 10
  const deltaKg = Math.round((pesoFinalBruto - pesoAtualKg) * 10) / 10

  const ritmoSemanalKg = (balancoDiarioKcal * 7) / KCAL_POR_KG
  const ritmoAcelerado = Math.abs(ritmoSemanalKg) > RITMO_MAXIMO_KG_SEMANA

  return { pontos, pesoFinalKg, deltaKg, ritmoSemanalKg, ritmoAcelerado }
}
