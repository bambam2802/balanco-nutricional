import { AvaliacaoProvider, useAvaliacao } from './state/avaliacao'
import { AppShell } from './components/AppShell'
import { StepDados } from './components/steps/StepDados'
import { StepResultados } from './components/steps/StepResultados'
import { StepRefeicoes } from './components/steps/StepRefeicoes'
import { StepBalanco } from './components/steps/StepBalanco'
import { Relatorio } from './components/report/Relatorio'
import { ErrorBoundary } from './components/ErrorBoundary'

function Roteador() {
  const { estado } = useAvaliacao()

  switch (estado.passo) {
    case 'dados':
      return <StepDados />
    case 'resultados':
      return <StepResultados />
    case 'refeicoes':
      return <StepRefeicoes />
    case 'balanco':
      return <StepBalanco />
    case 'relatorio':
      return <Relatorio />
    default:
      return <StepDados />
  }
}

function Shell() {
  const { estado } = useAvaliacao()
  const largura = estado.passo === 'refeicoes' || estado.passo === 'relatorio' ? '5xl' : '3xl'
  return (
    <AppShell largura={largura}>
      <Roteador />
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AvaliacaoProvider>
        <Shell />
      </AvaliacaoProvider>
    </ErrorBoundary>
  )
}
