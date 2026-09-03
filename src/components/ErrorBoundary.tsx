import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  quebrou: boolean
}

const CHAVE_STORAGE = 'balanco-nutricional:avaliacao:v1'

/**
 * Última linha de defesa na feira: se algo inesperado quebrar a tela,
 * oferece recomeçar a avaliação em vez de deixar a página em branco.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { quebrou: false }

  static getDerivedStateFromError(): State {
    return { quebrou: true }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error('Erro inesperado na avaliação', erro, info.componentStack)
  }

  recomecar = () => {
    try {
      sessionStorage.removeItem(CHAVE_STORAGE)
    } catch {
      // sem storage disponível: recarregar já basta
    }
    window.location.reload()
  }

  render() {
    if (!this.state.quebrou) return this.props.children

    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Algo saiu do esperado</h1>
        <p className="text-sm text-ink-2">
          Não foi possível continuar esta avaliação. Comece uma nova para seguir com o atendimento.
        </p>
        <Button size="lg" iconLeft={<RotateCcw size={18} />} onClick={this.recomecar}>
          Nova avaliação
        </Button>
      </main>
    )
  }
}
