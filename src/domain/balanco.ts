import type { Escolhas, Refeicao, ResultadoBalanco } from './types'

/** Tolerância padrão para classificar como normocalórico: 5% do VET. */
export const TOLERANCIA_NORMO = 0.05

/**
 * Soma as calorias das escolhas do dia alimentar. Refeição sem escolha ou
 * marcada como 'nao_faco' conta 0 kcal; opcaoId desconhecido também conta 0.
 */
export function somarCalorias(escolhas: Escolhas, refeicoes: Refeicao[]): number {
  let total = 0

  for (const refeicao of refeicoes) {
    const escolha = escolhas[refeicao.id]
    if (!escolha || escolha.tipo === 'nao_faco') continue

    const opcao = refeicao.opcoes.find((o) => o.id === escolha.opcaoId)
    if (opcao) total += opcao.kcal
  }

  return total
}

/**
 * Classifica o balanço calórico do dia: normocalórico quando a diferença
 * absoluta entre ingerido e VET está dentro da tolerância (padrão 5% do VET).
 */
export function classificarBalanco(
  vet: number,
  ingerido: number,
  tolerancia: number = TOLERANCIA_NORMO,
): ResultadoBalanco {
  const diferenca = ingerido - vet
  const toleranciaKcal = Math.round(vet * tolerancia)

  const classificacao =
    Math.abs(diferenca) <= toleranciaKcal
      ? 'normocalorico'
      : diferenca < 0
        ? 'deficit'
        : 'superavit'

  return { vet, ingerido, diferenca, classificacao, toleranciaKcal }
}
