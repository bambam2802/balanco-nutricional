import { AnimatePresence, motion } from 'framer-motion'
import { Leaf, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ORDEM_PASSOS, useAvaliacao } from '../state/avaliacao'
import { StepProgress } from './ui/StepProgress'
import { Button } from './ui/Button'

interface AppShellProps {
  children: ReactNode
  /** Largura do palco: passos normais usam 3xl, refeições pode usar 5xl. */
  largura?: '3xl' | '5xl'
}

function BotaoNovaAvaliacao() {
  const { dispatch } = useAvaliacao()
  const [confirmando, setConfirmando] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function onClick() {
    if (!confirmando) {
      setConfirmando(true)
      timeoutRef.current = setTimeout(() => setConfirmando(false), 3000)
      return
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setConfirmando(false)
    dispatch({ type: 'novaAvaliacao' })
  }

  return (
    <Button variant="ghost" size="md" iconLeft={<RotateCcw size={16} />} onClick={onClick}>
      {confirmando ? 'Confirmar reinício?' : 'Nova avaliação'}
    </Button>
  )
}

export function AppShell({ children, largura = '3xl' }: AppShellProps) {
  const { estado } = useAvaliacao()
  const [passoAnterior, setPassoAnterior] = useState(estado.passo)
  const [direcao, setDirecao] = useState(1)

  if (estado.passo !== passoAnterior) {
    const idxAtual = ORDEM_PASSOS.indexOf(estado.passo)
    const idxAnterior = ORDEM_PASSOS.indexOf(passoAnterior)
    setDirecao(idxAtual >= idxAnterior ? 1 : -1)
    setPassoAnterior(estado.passo)
  }

  const larguraClasse = largura === '5xl' ? 'max-w-5xl' : 'max-w-3xl'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
              <Leaf size={16} />
            </span>
            <span className="font-display text-lg font-semibold text-ink">Balanço Nutricional</span>
          </div>
          <BotaoNovaAvaliacao />
        </div>
      </header>

      <div className="no-print border-b border-border">
        <StepProgress passoAtual={estado.passo} />
      </div>

      <main className={`mx-auto w-full flex-1 px-4 py-6 sm:px-6 ${larguraClasse}`} style={{ clipPath: 'inset(0)' }}>
        <AnimatePresence mode="wait" custom={direcao}>
          <motion.div
            key={estado.passo}
            custom={direcao}
            initial={{ opacity: 0, x: direcao * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direcao * -24 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="no-print mx-auto w-full max-w-3xl px-4 pb-8 pt-2 text-xs text-ink-3 sm:px-6">
        <p>Ferramenta educativa. Não substitui avaliação com nutricionista.</p>
        <p>Curso de Nutrição — feira</p>
      </footer>
    </div>
  )
}
