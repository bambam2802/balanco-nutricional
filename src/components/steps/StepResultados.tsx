import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Ruler } from 'lucide-react'
import { useMemo } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import { calcularVET } from '../../domain/tmb'
import { calcularIMC, classificarIMC } from '../../domain/imc'
import { avaliarRiscoCV } from '../../domain/riscoCardio'
import { formatarKcal, formatarNumero } from '../../domain/formatar'
import { EQUACOES } from '../../data/equacoes'
import { NIVEIS_ATIVIDADE } from '../../data/atividade'
import type { ClassificacaoIMC, NivelRiscoCintura } from '../../domain/types'
import { Card, CardTitle } from '../ui/Card'
import { Badge, type BadgeTone } from '../ui/Badge'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Callout } from '../ui/Callout'
import { Button } from '../ui/Button'

const TOM_IMC: Record<ClassificacaoIMC, BadgeTone> = {
  baixo_peso: 'deficit',
  eutrofia: 'ok',
  sobrepeso: 'superavit',
  obesidade_1: 'danger',
  obesidade_2: 'danger',
  obesidade_3: 'danger',
  sem_classificacao: 'neutral',
}

const TOM_CINTURA: Record<NivelRiscoCintura, BadgeTone> = {
  normal: 'ok',
  aumentado: 'warn',
  muito_aumentado: 'danger',
}

function ReguaIMC({
  faixas,
  imc,
}: {
  faixas: { classificacao: ClassificacaoIMC; rotulo: string; min: number | null; max: number | null }[]
  imc: number
}) {
  const ESCALA_MIN = 12
  const ESCALA_MAX = 45
  const amplitude = ESCALA_MAX - ESCALA_MIN

  const posicaoMarcador = ((Math.min(Math.max(imc, ESCALA_MIN), ESCALA_MAX) - ESCALA_MIN) / amplitude) * 100

  const cores: Record<ClassificacaoIMC, string> = {
    baixo_peso: 'bg-deficit-soft',
    eutrofia: 'bg-ok-soft',
    sobrepeso: 'bg-superavit-soft',
    obesidade_1: 'bg-danger-soft',
    obesidade_2: 'bg-danger-soft',
    obesidade_3: 'bg-danger-soft',
    sem_classificacao: 'bg-surface-2',
  }

  return (
    <div className="mt-4">
      <div className="relative h-6">
        <div
          className="absolute -top-1 z-10 -translate-x-1/2"
          style={{ left: `${posicaoMarcador}%` }}
        >
          <div className="h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-ink" />
        </div>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {faixas.map((f) => {
          const min = f.min ?? ESCALA_MIN
          const max = f.max ?? ESCALA_MAX
          const largura = ((Math.min(max, ESCALA_MAX) - Math.max(min, ESCALA_MIN)) / amplitude) * 100
          return (
            <div
              key={f.classificacao}
              className={cores[f.classificacao]}
              style={{ width: `${Math.max(largura, 0)}%` }}
              title={f.rotulo}
            />
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-3">
        <span>{ESCALA_MIN}</span>
        <span>{ESCALA_MAX}</span>
      </div>
    </div>
  )
}

export function StepResultados() {
  const { estado, dispatch } = useAvaliacao()
  const dados = estado.dados

  const vet = useMemo(
    () => (dados ? calcularVET(dados, estado.equacao) : null),
    [dados, estado.equacao],
  )
  const imc = useMemo(
    () => (dados ? classificarIMC(calcularIMC(dados.pesoKg, dados.alturaCm), dados.idade) : null),
    [dados],
  )
  const risco = useMemo(() => (dados ? avaliarRiscoCV(dados) : null), [dados])

  if (!dados || !vet || !imc || !risco) {
    return (
      <div className="flex flex-col gap-4">
        <Callout tone="warn">Preencha seus dados antes de ver os resultados.</Callout>
        <Button variant="secondary" iconLeft={<ArrowLeft size={18} />} onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}>
          Voltar
        </Button>
      </div>
    )
  }

  const equacaoInfo = EQUACOES.find((e) => e.id === estado.equacao)!
  const nivelAtividadeInfo = NIVEIS_ATIVIDADE.find((n) => n.id === dados.atividade)!
  const rotuloSexo = dados.sexo === 'feminino' ? 'Mulher' : 'Homem'
  const alturaM = (dados.alturaCm / 100).toFixed(2).replace('.', ',')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Seus resultados</h1>
        <p className="mt-1 text-sm text-ink-2">
          {rotuloSexo}, {dados.idade} anos · {formatarNumero(dados.pesoKg, 1).replace('.', ',')} kg ·{' '}
          {alturaM} m · atividade {nivelAtividadeInfo.rotulo.toLowerCase()}
        </p>
      </div>

      <Card>
        <CardTitle>Gasto energético (VET)</CardTitle>

        <div className="mt-3">
          <SegmentedControl
            ariaLabel="Equação de cálculo"
            full
            value={estado.equacao}
            onChange={(equacao) => dispatch({ type: 'definirEquacao', equacao })}
            options={EQUACOES.map((e) => ({ value: e.id, label: e.rotuloCurto }))}
          />
        </div>

        <div className="mt-5 flex items-baseline gap-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={estado.equacao}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="num font-display text-5xl font-semibold text-ink"
            >
              {formatarNumero(vet.vet, 0)}
            </motion.span>
          </AnimatePresence>
          <span className="text-lg text-ink-2">kcal/dia</span>
        </div>

        <p className="num mt-2 text-sm text-ink-3">
          TMB {formatarKcal(vet.tmb)} × fator {formatarNumero(vet.fator, 3)} (atividade{' '}
          {nivelAtividadeInfo.rotulo.toLowerCase()})
        </p>
        <p className="mt-3 text-sm text-ink-2">{equacaoInfo.descricao}</p>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>IMC</CardTitle>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="num font-display text-4xl font-semibold text-ink">
              {formatarNumero(imc.imc, 1)}
            </span>
            <Badge tone={TOM_IMC[imc.classificacao]}>{imc.rotulo}</Badge>
          </div>

          {imc.classificacao === 'sem_classificacao' ? (
            <Callout tone="info" className="mt-4">
              Menor de 18 anos: o IMC é calculado, mas a classificação usa curvas específicas por
              idade, fora do escopo desta ferramenta.
            </Callout>
          ) : (
            <>
              <ReguaIMC faixas={imc.faixas} imc={imc.imc} />
              <p className="mt-3 text-xs text-ink-3">
                {imc.protocolo === 'lipschitz_idoso'
                  ? 'Classificação para idosos (60+) — Lipschitz, 1994'
                  : 'Classificação para adultos — OMS'}
              </p>
            </>
          )}
        </Card>

        <Card>
          <CardTitle>Risco cardiovascular</CardTitle>

          {risco.cintura === null ? (
            <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
              <Ruler size={28} className="text-ink-3" />
              <p className="text-sm text-ink-2">Medidas não informadas</p>
              <Button
                variant="ghost"
                size="md"
                onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}
              >
                Adicionar medidas
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-ink-2">
                    Circunferência da cintura — <span className="num font-medium text-ink">{formatarNumero(risco.cintura.valorCm, 0)} cm</span>
                  </p>
                  <Badge tone={TOM_CINTURA[risco.cintura.nivel]}>{risco.cintura.rotulo}</Badge>
                </div>
                <p className="num mt-1 text-xs text-ink-3">
                  OMS: ≥ {risco.cintura.cortes.aumentado} cm aumentado · ≥ {risco.cintura.cortes.muitoAumentado} cm muito aumentado
                </p>
              </div>

              {risco.rcq ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-ink-2">
                      Relação cintura/quadril —{' '}
                      <span className="num font-medium text-ink">{formatarNumero(risco.rcq.valor, 2)}</span>
                    </p>
                    <Badge tone={risco.rcq.risco ? 'danger' : 'ok'}>{risco.rcq.rotulo}</Badge>
                  </div>
                  <p className="num mt-1 text-xs text-ink-3">
                    OMS: {dados.sexo === 'feminino' ? 'mulher' : 'homem'} &gt; {formatarNumero(risco.rcq.corte, 2)}
                  </p>
                </div>
              ) : (
                <Callout tone="info">Informe o quadril para calcular a relação cintura/quadril.</Callout>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap-reverse items-center justify-between gap-3">
        <Button
          variant="secondary"
          iconLeft={<ArrowLeft size={18} />}
          className="w-full sm:w-auto"
          onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}
        >
          Voltar
        </Button>
        <Button
          size="lg"
          iconRight={<ArrowRight size={18} />}
          className="w-full sm:w-auto"
          onClick={() => dispatch({ type: 'irPara', passo: 'refeicoes' })}
        >
          Montar o dia alimentar
        </Button>
      </div>
    </div>
  )
}
