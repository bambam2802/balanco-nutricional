import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
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

const CHAVE_STORAGE = 'balanco-nutricional:avaliacao:v1'

function carregar(): EstadoAvaliacao {
  try {
    const bruto = sessionStorage.getItem(CHAVE_STORAGE)
    if (!bruto) return ESTADO_INICIAL
    const salvo = JSON.parse(bruto) as Partial<EstadoAvaliacao>
    return { ...ESTADO_INICIAL, ...salvo }
  } catch {
    return ESTADO_INICIAL
  }
}

function salvar(estado: EstadoAvaliacao) {
  try {
    sessionStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado))
  } catch {
    // Sem storage (modo privado, etc.): a avaliação segue só em memória.
  }
}

interface ContextoAvaliacao {
  estado: EstadoAvaliacao
  dispatch: (acao: AcaoAvaliacao) => void
}

const Contexto = createContext<ContextoAvaliacao | null>(null)

export function AvaliacaoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, undefined, carregar)

  useEffect(() => {
    salvar(estado)
  }, [estado])

  return <Contexto.Provider value={{ estado, dispatch }}>{children}</Contexto.Provider>
}

export function useAvaliacao(): ContextoAvaliacao {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAvaliacao precisa estar dentro de <AvaliacaoProvider>')
  return ctx
}
