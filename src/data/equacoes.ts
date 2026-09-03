import type { Equacao } from '../domain/types'

export interface EquacaoInfo {
  id: Equacao
  rotulo: string
  rotuloCurto: string
  descricao: string
}

export const EQUACOES: EquacaoInfo[] = [
  {
    id: 'mifflin',
    rotulo: 'Mifflin-St Jeor',
    rotuloCurto: 'Mifflin',
    descricao: 'Peso, altura, idade e sexo. Mais precisa para a população atual.',
  },
  {
    id: 'harris',
    rotulo: 'Harris-Benedict (1984)',
    rotuloCurto: 'Harris-Benedict',
    descricao: 'Clássica, revisada por Roza e Shizgal em 1984.',
  },
  {
    id: 'fao',
    rotulo: 'FAO/OMS 2004',
    rotuloCurto: 'FAO/OMS',
    descricao: 'Usa só o peso, por faixa etária e sexo.',
  },
]
