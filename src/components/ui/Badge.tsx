import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeTone =
  | 'brand'
  | 'deficit'
  | 'normo'
  | 'superavit'
  | 'warn'
  | 'danger'
  | 'ok'
  | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

const TONS: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-brand-ink',
  deficit: 'bg-deficit-soft text-deficit',
  normo: 'bg-normo-soft text-normo',
  superavit: 'bg-superavit-soft text-superavit',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  ok: 'bg-ok-soft text-ok',
  neutral: 'bg-surface-2 text-ink-2',
}

export function Badge({ tone = 'neutral', icon, children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
        TONS[tone],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
