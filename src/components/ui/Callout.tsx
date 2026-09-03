import { Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export type CalloutTone = 'info' | 'warn'

export interface CalloutProps {
  tone?: CalloutTone
  children: ReactNode
  className?: string
}

const TONS: Record<CalloutTone, string> = {
  info: 'bg-brand-soft text-brand-ink',
  warn: 'bg-warn-soft text-warn',
}

const ICONES: Record<CalloutTone, ReactNode> = {
  info: <Info size={16} className="shrink-0 mt-0.5" />,
  warn: <TriangleAlert size={16} className="shrink-0 mt-0.5" />,
}

export function Callout({ tone = 'info', children, className = '' }: CalloutProps) {
  return (
    <div
      className={['flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm', TONS[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      {ICONES[tone]}
      <span>{children}</span>
    </div>
  )
}
