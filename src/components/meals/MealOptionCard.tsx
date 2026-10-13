import { Ban, Check, Pencil, Utensils } from 'lucide-react'
import { useState } from 'react'
import { DESCRICAO_MANUAL_MAX, KCAL_MANUAL_MAX, type Escolha, type OpcaoRefeicao } from '../../domain/types'
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

interface MealManualCardProps {
  escolha: Extract<Escolha, { tipo: 'manual' }> | undefined
  onEscolher: (escolha: Escolha) => void
}

export function MealManualCard({ escolha, onEscolher }: MealManualCardProps) {
  const selecionada = Boolean(escolha)
  const [texto, setTexto] = useState(escolha && escolha.kcal > 0 ? String(escolha.kcal) : '')

  const [descricao, setDescricao] = useState(escolha?.descricao ?? '')

  function emitir(textoKcal: string, textoDescricao: string) {
    const kcal = Math.min(Number(textoKcal) || 0, KCAL_MANUAL_MAX)
    onEscolher({ tipo: 'manual', kcal, descricao: textoDescricao })
  }

  function digitar(bruto: string) {
    const limpo = bruto.replace(/\D/g, '').slice(0, 4)
    setTexto(limpo)
    emitir(limpo, descricao)
  }

  function descrever(bruto: string) {
    setDescricao(bruto)
    emitir(texto, bruto)
  }

  return (
    <div
      className={[
        'flex w-full flex-col gap-3 rounded-card border-2 border-dashed bg-surface px-4 py-3 text-left transition-all duration-150 sm:col-span-2 sm:flex-row sm:items-center lg:col-span-4',
        selecionada ? 'border-brand ring-2 ring-brand bg-brand-soft' : 'border-border-strong hover:border-ink-3',
      ].join(' ')}
    >
      <button
        type="button"
        aria-pressed={selecionada}
        onClick={() => onEscolher({ tipo: 'manual', kcal: escolha?.kcal ?? 0, descricao })}
        className="flex flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <span
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            selecionada ? 'bg-brand text-white' : 'bg-surface-2 text-ink-3',
          ].join(' ')}
        >
          {selecionada ? <Check size={18} strokeWidth={3} /> : <Pencil size={18} />}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-ink">Nenhuma opção, inserir kcal manualmente</span>
          <span className="text-xs text-ink-2">Descreva a refeição e digite as calorias</span>
        </span>
      </button>
      {selecionada && (
        <div className="flex w-full flex-col gap-2 sm:w-[28rem] sm:flex-row">
          <input
            type="text"
            autoFocus
            maxLength={DESCRICAO_MANUAL_MAX}
            aria-label="O que é esta refeição"
            placeholder="O que come? Ex.: 2 ovos mexidos e 1 pão"
            value={descricao}
            onChange={(e) => descrever(e.target.value)}
            className="h-11 w-full min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-base text-ink outline-none focus:border-brand"
          />
          <div className="relative w-full shrink-0 sm:w-32">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Calorias desta refeição"
              placeholder="Ex.: 350"
              value={texto}
              onChange={(e) => digitar(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 pr-12 text-base text-ink outline-none focus:border-brand"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-3">kcal</span>
          </div>
        </div>
      )}
    </div>
  )
}
