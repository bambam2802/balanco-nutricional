import type { Escolhas, Refeicao } from '../../domain/types'

interface MealDotsProps {
  refeicoes: Refeicao[]
  atual: number
  escolhas: Escolhas
  onSelect: (indice: number) => void
}

/** Progresso das 6 refeições: feita = brand, atual = brand com anel, futura = muted. */
export function MealDots({ refeicoes, atual, escolhas, onSelect }: MealDotsProps) {
  return (
    <ol className="flex items-center justify-center">
      {refeicoes.map((refeicao, i) => {
        const respondida = Boolean(escolhas[refeicao.id])
        const ativa = i === atual
        const clicavel = respondida && !ativa

        const dot = (
          <span
            className={[
              'block h-2 w-2 rounded-full transition-all duration-150',
              ativa ? 'h-2.5 w-2.5 bg-brand ring-2 ring-brand ring-offset-2 ring-offset-bg' : '',
              !ativa && respondida ? 'bg-brand' : '',
              !ativa && !respondida ? 'bg-surface-3' : '',
            ].join(' ')}
          />
        )

        return (
          <li key={refeicao.id}>
            {clicavel ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Voltar para ${refeicao.nome}`}
                className="flex h-11 w-11 cursor-pointer items-center justify-center"
              >
                {dot}
              </button>
            ) : (
              <span
                aria-current={ativa ? 'step' : undefined}
                aria-label={refeicao.nome}
                className="flex h-11 w-11 items-center justify-center"
              >
                {dot}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
