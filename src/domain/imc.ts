import type { FaixaIMC, ResultadoIMC } from './types'

/** Faixas de IMC para adultos (18–59 anos) — classificação OMS. */
export const FAIXAS_IMC_ADULTO: FaixaIMC[] = [
  { classificacao: 'baixo_peso', rotulo: 'Baixo peso', min: null, max: 18.5 },
  { classificacao: 'eutrofia', rotulo: 'Peso adequado', min: 18.5, max: 25 },
  { classificacao: 'sobrepeso', rotulo: 'Sobrepeso', min: 25, max: 30 },
  { classificacao: 'obesidade_1', rotulo: 'Obesidade grau I', min: 30, max: 35 },
  { classificacao: 'obesidade_2', rotulo: 'Obesidade grau II', min: 35, max: 40 },
  { classificacao: 'obesidade_3', rotulo: 'Obesidade grau III', min: 40, max: null },
]

/**
 * Faixas de IMC para idosos (≥ 60 anos) — Lipschitz (1994).
 * Atenção: `max` aqui é tratado como INCLUSIVO para a faixa de eutrofia
 * (27 é eutrofia, só acima de 27 é sobrepeso) — ver `classificarIMC`,
 * que aplica `imc > 27` explicitamente para o protocolo idoso.
 */
export const FAIXAS_IMC_IDOSO: FaixaIMC[] = [
  { classificacao: 'baixo_peso', rotulo: 'Baixo peso', min: null, max: 22 },
  { classificacao: 'eutrofia', rotulo: 'Peso adequado', min: 22, max: 27 },
  { classificacao: 'sobrepeso', rotulo: 'Sobrepeso', min: 27, max: null },
]

/** IMC = peso (kg) / altura (m)². Valor bruto, sem arredondar — quem exibe arredonda. */
export function calcularIMC(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100
  return pesoKg / (alturaM * alturaM)
}

/**
 * Classifica o IMC conforme a idade:
 * - < 18 anos: sem classificação (usa-se curvas por idade, fora de escopo aqui).
 * - 18–59 anos: OMS (adulto).
 * - ≥ 60 anos: Lipschitz (1994) — idoso. Regra especial: 27,0 é eutrofia,
 *   só valores estritamente acima de 27 são sobrepeso (comparação `> 27`).
 */
export function classificarIMC(imc: number, idade: number): ResultadoIMC {
  if (idade < 18) {
    return {
      imc,
      classificacao: 'sem_classificacao',
      rotulo: 'Sem classificação (menor de 18 anos usa curvas por idade)',
      protocolo: 'nenhum',
      faixas: [],
    }
  }

  if (idade >= 60) {
    const classificacao = imc < 22 ? 'baixo_peso' : imc > 27 ? 'sobrepeso' : 'eutrofia'
    const faixa = FAIXAS_IMC_IDOSO.find((f) => f.classificacao === classificacao)!
    return {
      imc,
      classificacao,
      rotulo: faixa.rotulo,
      protocolo: 'lipschitz_idoso',
      faixas: FAIXAS_IMC_IDOSO,
    }
  }

  const faixa =
    FAIXAS_IMC_ADULTO.find(
      (f) => (f.min === null || imc >= f.min) && (f.max === null || imc < f.max),
    ) ?? FAIXAS_IMC_ADULTO[FAIXAS_IMC_ADULTO.length - 1]

  return {
    imc,
    classificacao: faixa.classificacao,
    rotulo: faixa.rotulo,
    protocolo: 'oms_adulto',
    faixas: FAIXAS_IMC_ADULTO,
  }
}
