import type { NivelAtividade } from '../domain/types'

export interface NivelAtividadeInfo {
  id: NivelAtividade
  rotulo: string
  descricao: string
  fator: number
}

/** Fatores de atividade FAO/OMS. Descrições em linguagem de feira. */
export const NIVEIS_ATIVIDADE: NivelAtividadeInfo[] = [
  { id: 'sedentario', rotulo: 'Sedentário', descricao: 'Pouco ou nenhum exercício, trabalho sentado', fator: 1.2 },
  { id: 'leve', rotulo: 'Leve', descricao: 'Exercício leve 1 a 3 vezes por semana', fator: 1.375 },
  { id: 'moderado', rotulo: 'Moderado', descricao: 'Exercício moderado 3 a 5 vezes por semana', fator: 1.55 },
  { id: 'intenso', rotulo: 'Intenso', descricao: 'Exercício pesado 6 a 7 vezes por semana', fator: 1.725 },
  { id: 'muito_intenso', rotulo: 'Muito intenso', descricao: 'Treino pesado 2x ao dia ou trabalho físico', fator: 1.9 },
]
