import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { ESTADO_INICIAL, reducer, type AcaoAvaliacao, type EstadoAvaliacao } from './reducer'

export type { AcaoAvaliacao, EstadoAvaliacao, Passo } from './reducer'

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

// oxlint-disable-next-line react/only-export-components -- hook convive com o provider por conveniência
export function useAvaliacao(): ContextoAvaliacao {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAvaliacao precisa estar dentro de <AvaliacaoProvider>')
  return ctx
}
