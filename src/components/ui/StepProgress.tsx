import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Passo } from '../../state/avaliacao'

interface PassoInfo {
  passo: Passo
  rotulo: string
}

// 4 passos visíveis: 'relatorio' é exibido como parte de 'Balanço'.
const PASSOS: PassoInfo[] = [
  { passo: 'dados', rotulo: 'Dados' },
  { passo: 'resultados', rotulo: 'Resultados' },
  { passo: 'refeicoes', rotulo: 'Refeições' },
  { passo: 'balanco', rotulo: 'Balanço' },
]

function indiceVisivel(passo: Passo): number {
  if (passo === 'relatorio') return 3
  return PASSOS.findIndex((p) => p.passo === passo)
}

export interface StepProgressProps {
  passoAtual: Passo
}

export function StepProgress({ passoAtual }: StepProgressProps) {
  const atual = indiceVisivel(passoAtual)

  return (
    <nav aria-label="Progresso da avaliação" className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
      {/* Mobile: só o passo atual */}
      <div className="flex items-center justify-between text-sm sm:hidden">
        <span className="font-medium text-ink">{PASSOS[atual]?.rotulo}</span>
        <span className="text-ink-3">
          {atual + 1} de {PASSOS.length}
        </span>
      </div>

      <ol className="mt-2 flex items-center gap-2 sm:mt-0">
        {PASSOS.map((p, i) => {
          const concluido = i < atual
          const ativo = i === atual
          return (
            <li key={p.passo} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <span
                  className={[
                    'hidden text-xs font-medium sm:block',
                    ativo ? 'text-brand-ink' : concluido ? 'text-ink-2' : 'text-ink-3',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-1">
                    {concluido ? <Check size={12} /> : null}
                    {p.rotulo}
                  </span>
                </span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={false}
                    animate={{ width: concluido || ativo ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={concluido || ativo ? 'h-full bg-brand' : 'h-full'}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
