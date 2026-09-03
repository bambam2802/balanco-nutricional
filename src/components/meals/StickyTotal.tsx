import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatarKcal, formatarNumero } from '../../domain/formatar'
import { Button } from '../ui/Button'

interface StickyTotalProps {
  acumulado: number
  vet: number
  onVoltar: () => void
  onAvancar: () => void
  avancarDesabilitado: boolean
  isUltima: boolean
}

export function StickyTotal({
  acumulado,
  vet,
  onVoltar,
  onAvancar,
  avancarDesabilitado,
  isUltima,
}: StickyTotalProps) {
  const percentual = vet > 0 ? Math.min((acumulado / vet) * 100, 100) : 0
  const ultrapassou = acumulado > vet

  // Portal: o palco do AppShell usa clip-path, que recortaria um elemento fixo descendente.
  return createPortal(
    <div
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 sm:w-64">
          <p className="text-xs text-ink-3">Acumulado</p>
          <div className="flex items-baseline gap-1.5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={acumulado}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="num font-display text-2xl font-semibold text-ink"
              >
                {formatarNumero(acumulado, 0)}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-ink-2">kcal</span>
          </div>
          <p className="num text-xs text-ink-3">de {formatarKcal(vet)} (seu VET)</p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${ultrapassou ? 'bg-superavit' : 'bg-brand'}`}
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Button variant="ghost" iconLeft={<ArrowLeft size={18} />} onClick={onVoltar}>
            Voltar
          </Button>
          <div className="flex flex-col items-end gap-1">
            <Button
              size="lg"
              iconRight={<ArrowRight size={18} />}
              disabled={avancarDesabilitado}
              onClick={onAvancar}
            >
              {isUltima ? 'Ver meu balanço' : 'Próxima refeição'}
            </Button>
            {avancarDesabilitado && (
              <span className="text-xs text-ink-3">Escolha uma opção ou "não faço"</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
