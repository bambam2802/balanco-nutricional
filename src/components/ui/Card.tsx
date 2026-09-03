import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'md' | 'lg'
}

export function Card({ children, padding = 'lg', className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-card',
        padding === 'lg' ? 'p-5 sm:p-6' : 'p-4 sm:p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <p
      className={['text-xs font-medium uppercase tracking-wide text-ink-3', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </p>
  )
}
