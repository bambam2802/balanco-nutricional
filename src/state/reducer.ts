import type { DadosPessoa, Equacao, Escolha, Escolhas, RefeicaoId } from '../domain/types'
import { REFEICOES } from '../data/refeicoes'
import { NIVEIS_ATIVIDADE } from '../data/atividade'
import { EQUACOES } from '../data/equacoes'

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

const ULTIMA_REFEICAO = REFEICOES.length - 1

function limitarIndice(indice: unknown): number {
  if (typeof indice !== 'number' || !Number.isFinite(indice)) return 0
  return Math.max(0, Math.min(ULTIMA_REFEICAO, Math.trunc(indice)))
}

function numeroValido(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
}

function sanitizarDados(bruto: unknown): DadosPessoa | null {
  if (!bruto || typeof bruto !== 'object') return null
  const d = bruto as Record<string, unknown>
  const sexoOk = d.sexo === 'masculino' || d.sexo === 'feminino'
  const atividadeOk = NIVEIS_ATIVIDADE.some((n) => n.id === d.atividade)
  if (!sexoOk || !atividadeOk) return null
  if (!numeroValido(d.idade, 1, 130) || !numeroValido(d.pesoKg, 1, 500) || !numeroValido(d.alturaCm, 30, 300)) {
    return null
  }
  return {
    sexo: d.sexo as DadosPessoa['sexo'],
    idade: d.idade,
    pesoKg: d.pesoKg,
    alturaCm: d.alturaCm,
    atividade: d.atividade as DadosPessoa['atividade'],
    cinturaCm: numeroValido(d.cinturaCm, 1, 400) ? d.cinturaCm : undefined,
    quadrilCm: numeroValido(d.quadrilCm, 1, 400) ? d.quadrilCm : undefined,
  }
}

function sanitizarEscolhas(bruto: unknown): Escolhas {
  const resultado: Escolhas = {}
  if (!bruto || typeof bruto !== 'object') return resultado
  for (const refeicao of REFEICOES) {
    const e = (bruto as Record<string, unknown>)[refeicao.id]
    if (!e || typeof e !== 'object') continue
    const { tipo, opcaoId } = e as Record<string, unknown>
    if (tipo === 'nao_faco') resultado[refeicao.id] = { tipo: 'nao_faco' }
    else if (tipo === 'opcao' && typeof opcaoId === 'string') resultado[refeicao.id] = { tipo: 'opcao', opcaoId }
  }
  return resultado
}

/**
 * Valida um estado vindo de fora (sessionStorage de outra versão, dado corrompido).
 * Nunca lança: o que não for reconhecido cai no valor inicial.
 */
export function sanitizarEstado(bruto: unknown): EstadoAvaliacao {
  if (!bruto || typeof bruto !== 'object') return ESTADO_INICIAL
  const b = bruto as Record<string, unknown>
  const dados = sanitizarDados(b.dados)
  const passoSalvo = ORDEM_PASSOS.includes(b.passo as Passo) ? (b.passo as Passo) : 'dados'
  return {
    passo: dados ? passoSalvo : 'dados',
    dados,
    equacao: EQUACOES.some((e) => e.id === b.equacao) ? (b.equacao as Equacao) : ESTADO_INICIAL.equacao,
    escolhas: sanitizarEscolhas(b.escolhas),
    refeicaoAtual: limitarIndice(b.refeicaoAtual),
  }
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
      return { ...estado, refeicaoAtual: limitarIndice(acao.indice) }
    case 'irPara':
      return { ...estado, passo: acao.passo }
    case 'novaAvaliacao':
      return ESTADO_INICIAL
  }
}
