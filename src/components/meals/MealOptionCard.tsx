import { Ban, Check, Utensils } from 'lucide-react'
import { useState } from 'react'
import type { OpcaoRefeicao } from '../../domain/types'
import { formatarKcal } from '../../domain/formatar'
import { Badge } from '../ui/Badge'

interface MealOptionCardProps {
  opcao: OpcaoRefeicao
  selecionada: boolean
  onSelect: () => void
}

export function MealOptionCard({ opcao, selecionada, onSelect }: MealOptionCardProps) {
  const [erroFoto, setErroFoto] = useState(false)

  return (
    <button
      type="button"
      aria-pressed={selecionada}
      onClick={onSelect}
      className={[
        'flex h-full flex-col overflow-hidden rounded-card border bg-surface text-left transition-all duration-150 active:scale-[0.99]',
        selecionada ? 'border-brand ring-2 ring-brand' : 'border-border hover:border-border-strong',
      ].join(' ')}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {erroFoto ? (
          <div className="flex h-full w-full items-center justify-center">
            <Utensils size={28} className="text-ink-3" />
          </div>
        ) : (
          <img
            src={opcao.foto}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setErroFoto(true)}
            className="h-full w-full object-cover"
          />
        )}
        {selecionada && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-pop">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-semibold text-ink">{opcao.nome}</p>
        <p className="line-clamp-2 text-xs text-ink-2">{opcao.descricao}</p>
        <div className="mt-auto pt-2">
          <Badge tone="neutral">
            <span className="num">{formatarKcal(opcao.kcal)}</span>
          </Badge>
        </div>
      </div>
    </button>
  )
}

interface MealNaoFacoCardProps {
  selecionada: boolean
  onSelect: () => void
}

export function MealNaoFacoCard({ selecionada, onSelect }: MealNaoFacoCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selecionada}
      onClick={onSelect}
      className={[
        'flex w-full items-center gap-3 rounded-card border-2 border-dashed bg-surface px-4 py-3 text-left transition-all duration-150 active:scale-[0.99] sm:col-span-2 lg:col-span-4',
        selecionada ? 'border-brand ring-2 ring-brand bg-brand-soft' : 'border-border-strong hover:border-ink-3',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          selecionada ? 'bg-brand text-white' : 'bg-surface-2 text-ink-3',
        ].join(' ')}
      >
        {selecionada ? <Check size={18} strokeWidth={3} /> : <Ban size={18} />}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink">Não faço esta refeição</span>
        <span className="text-xs text-ink-2">Pulo esse horário no meu dia a dia</span>
      </span>
    </button>
  )
}
