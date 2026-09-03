import { motion } from 'framer-motion'
import { useId, type KeyboardEvent } from 'react'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  hint?: string
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
  full?: boolean
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  full,
  className = '',
}: SegmentedControlProps<T>) {
  const layoutId = useId()

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const idx = options.findIndex((o) => o.value === value)
    if (idx === -1) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(options[(idx + 1) % options.length].value)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(options[(idx - 1 + options.length) % options.length].value)
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={[
        'inline-flex gap-1 rounded-full bg-surface-2 p-1',
        full ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((opt) => {
        const ativo = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={[
              'relative flex-1 min-w-0 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none',
              ativo ? 'text-white' : 'text-ink-2 hover:text-ink',
            ].join(' ')}
          >
            {ativo ? (
              <motion.span
                layoutId={`${layoutId}-pill`}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute inset-0 rounded-full bg-brand"
              />
            ) : null}
            <span className="relative z-10 flex flex-col items-center leading-tight">
              <span>{opt.label}</span>
              {opt.hint ? (
                <span className={ativo ? 'text-white/80 text-xs' : 'text-ink-3 text-xs'}>
                  {opt.hint}
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
