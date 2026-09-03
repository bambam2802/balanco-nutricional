export type Sexo = 'masculino' | 'feminino'

export type NivelAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso'

export type Equacao = 'mifflin' | 'harris' | 'fao'

export interface DadosPessoa {
  sexo: Sexo
  idade: number
  pesoKg: number
  alturaCm: number
  atividade: NivelAtividade
  /** Opcionais: sem eles o risco cardiovascular não é classificado. */
  cinturaCm?: number
  quadrilCm?: number
  /** % de gordura corporal medida; opcional, 1–70. Sem ela o modelo de Hall estima por Jackson 2002. */
  gorduraPct?: number
}

export interface ResultadoVET {
  tmb: number
  fator: number
  vet: number
  equacao: Equacao
}

export type ClassificacaoIMC =
  | 'baixo_peso'
  | 'eutrofia'
  | 'sobrepeso'
  | 'obesidade_1'
  | 'obesidade_2'
  | 'obesidade_3'
  | 'sem_classificacao'

export type ProtocoloIMC = 'oms_adulto' | 'lipschitz_idoso' | 'nenhum'

export interface FaixaIMC {
  classificacao: ClassificacaoIMC
  rotulo: string
  /** Limite inferior inclusivo; null = sem limite. */
  min: number | null
  /** Limite superior exclusivo; null = sem limite. */
  max: number | null
}

export interface ResultadoIMC {
  imc: number
  classificacao: ClassificacaoIMC
  rotulo: string
  protocolo: ProtocoloIMC
  faixas: FaixaIMC[]
}

export type NivelRiscoCintura = 'normal' | 'aumentado' | 'muito_aumentado'

export interface ResultadoCintura {
  valorCm: number
  nivel: NivelRiscoCintura
  rotulo: string
  /** Pontos de corte usados (OMS), para exibir na tela. */
  cortes: { aumentado: number; muitoAumentado: number }
}

export interface ResultadoRCQ {
  valor: number
  risco: boolean
  rotulo: string
  corte: number
}

export interface ResultadoRiscoCV {
  cintura: ResultadoCintura | null
  rcq: ResultadoRCQ | null
}

export type RefeicaoId = 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'

export interface OpcaoRefeicao {
  id: string
  nome: string
  descricao: string
  kcal: number
  /** 1 = mais leve/saudável … 4 = mais calórica. */
  nivel: 1 | 2 | 3 | 4
  foto: string
}

export interface Refeicao {
  id: RefeicaoId
  nome: string
  horario: string
  opcoes: OpcaoRefeicao[]
}

export type Escolha = { tipo: 'opcao'; opcaoId: string } | { tipo: 'nao_faco' }

export type Escolhas = Partial<Record<RefeicaoId, Escolha>>

export type ClassificacaoBalanco = 'deficit' | 'normocalorico' | 'superavit'

export interface ResultadoBalanco {
  vet: number
  ingerido: number
  /** ingerido − vet (positivo = superávit). */
  diferenca: number
  classificacao: ClassificacaoBalanco
  toleranciaKcal: number
}

export interface PontoProjecao {
  semana: number
  pesoKg: number
}

export interface Projecao {
  pontos: PontoProjecao[]
  pesoFinalKg: number
  deltaKg: number
  ritmoSemanalKg: number
  /** |ritmo| > 1 kg/semana: fora do recomendado. */
  ritmoAcelerado: boolean
}
