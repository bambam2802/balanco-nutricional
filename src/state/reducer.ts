import type { DadosPessoa, Equacao, Escolha, Escolhas, RefeicaoId } from '../domain/types'

export type Passo = 'dados' | 'resultados' | 'refeicoes' | 'balanco' | 'relatorio'

export const ORDEM_PASSOS: Passo[] = ['dados', 'resultados', 'refeicoes', 'balanco', 'relatorio']

export interface EstadoAvaliacao {
  passo: Passo
  dados: DadosPessoa | null
  equacao: Equacao
  escolhas: Escolhas
  /** Índice da refeição em foco no passo 3 (0–5). */
  refeicaoAtual: number
}

export type AcaoAvaliacao =
  | { type: 'definirDados'; dados: DadosPessoa }
  | { type: 'definirEquacao'; equacao: Equacao }
  | { type: 'escolher'; refeicao: RefeicaoId; escolha: Escolha }
  | { type: 'irParaRefeicao'; indice: number }
  | { type: 'irPara'; passo: Passo }
  | { type: 'novaAvaliacao' }

export const ESTADO_INICIAL: EstadoAvaliacao = {
  passo: 'dados',
  dados: null,
  equacao: 'mifflin',
  escolhas: {},
  refeicaoAtual: 0,
}

export function reducer(estado: EstadoAvaliacao, acao: AcaoAvaliacao): EstadoAvaliacao {
  switch (acao.type) {
    case 'definirDados':
      return { ...estado, dados: acao.dados, passo: 'resultados' }
    case 'definirEquacao':
      return { ...estado, equacao: acao.equacao }
    case 'escolher':
      return { ...estado, escolhas: { ...estado.escolhas, [acao.refeicao]: acao.escolha } }
    case 'irParaRefeicao':
      return { ...estado, refeicaoAtual: Math.max(0, Math.min(5, acao.indice)) }
    case 'irPara':
      return { ...estado, passo: acao.passo }
    case 'novaAvaliacao':
      return ESTADO_INICIAL
  }
}
