import { motion } from 'framer-motion'
import type { Escolha, Refeicao } from '../../domain/types'
import { MealNaoFacoCard, MealOptionCard } from './MealOptionCard'

interface MealScreenProps {
  refeicao: Refeicao
  indice: number
  total: number
  escolha: Escolha | undefined
  onEscolher: (escolha: Escolha) => void
}

export function MealScreen({ refeicao, indice, total, escolha, onEscolher }: MealScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex flex-col gap-6"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
          Refeição {indice + 1} de {total}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{refeicao.nome}</h1>
          <span className="text-sm text-ink-3">por volta das {refeicao.horario}</span>
        </div>
        <p className="mt-1 text-sm text-ink-2">
          Toque na opção mais parecida com o que você costuma comer
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {refeicao.opcoes.map((opcao) => (
          <MealOptionCard
            key={opcao.id}
            opcao={opcao}
            selecionada={escolha?.tipo === 'opcao' && escolha.opcaoId === opcao.id}
            onSelect={() => onEscolher({ tipo: 'opcao', opcaoId: opcao.id })}
          />
        ))}
        <MealNaoFacoCard
          selecionada={escolha?.tipo === 'nao_faco'}
          onSelect={() => onEscolher({ tipo: 'nao_faco' })}
        />
      </div>
    </motion.div>
  )
}
