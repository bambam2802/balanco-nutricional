/** Sinal de menos tipográfico (U+2212), mais legível que o hífen em números. */
const SINAL_MENOS = '−'

/** Formata número no padrão pt-BR (separador de milhar '.', decimal ','). */
export function formatarNumero(n: number, casas = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(n)
}

/** Formata valor calórico: "2.350 kcal". */
export function formatarKcal(n: number): string {
  return `${formatarNumero(n, 0)} kcal`
}

/** Formata peso: "68,2 kg". */
export function formatarKg(n: number, casas = 1): string {
  return `${formatarNumero(n, casas)} kg`
}

/** Formata número com sinal explícito: "+250" / "−250" / "0". */
/** "1 ano" para 52 semanas; senão "N semanas". Usado em tela e relatório para o mesmo texto. */
export function rotuloSemanas(semanas: number): string {
  return semanas === 52 ? '1 ano' : `${semanas} semanas`
}

export function formatarSinal(n: number, casas = 0): string {
  const fator = 10 ** casas
  const arredondado = Math.round(n * fator) / fator

  if (arredondado === 0) return '0'

  const sinal = arredondado > 0 ? '+' : SINAL_MENOS
  return `${sinal}${formatarNumero(Math.abs(arredondado), casas)}`
}
