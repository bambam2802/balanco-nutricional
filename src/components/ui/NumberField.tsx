import { useId } from 'react'

export interface NumberFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  unit?: string
  hint?: string
  error?: string
  inputMode?: 'decimal' | 'numeric'
  min?: number
  max?: number
  step?: number
  required?: boolean
  autoFocus?: boolean
  className?: string
}

export function NumberField({
  label,
  value,
  onChange,
  onBlur,
  unit,
  hint,
  error,
  inputMode = 'decimal',
  min,
  max,
  step,
  required,
  autoFocus,
  className = '',
}: NumberFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'h-11 w-full rounded-lg border bg-surface px-3 text-base text-ink outline-none transition-colors',
            unit ? 'pr-12' : '',
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-brand',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {unit ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-3">
            {unit}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1 text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
