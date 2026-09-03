import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: ReactNode
  iconRight?: ReactNode
  full?: boolean
}

const VARIANTES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong disabled:bg-surface-2 disabled:text-ink-3',
  secondary:
    'bg-surface text-ink border border-border hover:border-border-strong disabled:bg-surface-2 disabled:text-ink-3 disabled:border-border',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 disabled:text-ink-3',
}

const TAMANHOS: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  full,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-150',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTES[variant],
        TAMANHOS[size],
        full ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
