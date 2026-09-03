import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import { calcularVET } from '../../domain/tmb'
import { somarCalorias, classificarBalanco } from '../../domain/balanco'
import { projetarPeso } from '../../domain/projecao'
import { formatarKcal, formatarKg, formatarSinal } from '../../domain/formatar'
import { REFEICOES } from '../../data/refeicoes'
import type { ClassificacaoBalanco } from '../../domain/types'
import type { BadgeTone } from '../ui/Badge'
import type { TomProjecao } from '../charts/ProjecaoChart'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Callout } from '../ui/Callout'
import { SegmentedControl } from '../ui/SegmentedControl'
import { Button } from '../ui/Button'
import { ProjecaoChart } from '../charts/ProjecaoChart'
import { ResumoRefeicoes } from '../report/ResumoRefeicoes'

const TOM: Record<ClassificacaoBalanco, TomProjecao> = {
  deficit: 'deficit',
  normocalorico: 'normo',
  superavit: 'superavit',
}

const TOM_TEXTO: Record<ClassificacaoBalanco, string> = {
  deficit: 'text-deficit',
  normocalorico: 'text-normo',
  superavit: 'text-superavit',
}

const TOM_BG: Record<ClassificacaoBalanco, string> = {
  deficit: 'bg-deficit',
  normocalorico: 'bg-normo',
  superavit: 'bg-superavit',
}

const TOM_BADGE: Record<ClassificacaoBalanco, BadgeTone> = {
  deficit: 'deficit',
  normocalorico: 'normo',
  superavit: 'superavit',
}

const EXPLICACAO: Record<ClassificacaoBalanco, string> = {
  deficit: 'Come menos do que gasta: tendência de perder peso ao longo das semanas',
  normocalorico: 'Come e gasta em equilíbrio: tendência de manter o peso',
  superavit: 'Come mais do que gasta: tendência de ganhar peso',
}

type OpcaoSemana = '4' | '12' | '24'

const OPCOES_SEMANA: { value: OpcaoSemana; label: string }[] = [
  { value: '4', label: '4 semanas' },
  { value: '12', label: '12 semanas' },
  { value: '24', label: '24 semanas' },
]

function BarraComparativa({
  rotulo,
  valor,
  maior,
  corBarra,
}: {
  rotulo: string
  valor: number
  maior: number
  corBarra: string
}) {
  const largura = maior > 0 ? Math.max((valor / maior) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-ink-2 sm:w-36">{rotulo}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${largura}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${corBarra}`}
        />
      </div>
      <span className="num w-24 shrink-0 text-right text-sm font-medium text-ink">
        {formatarKcal(valor)}
      </span>
    </div>
  )
}

export function StepBalanco() {
  const { estado, dispatch } = useAvaliacao()
  const dados = estado.dados
  const [semanas, setSemanas] = useState<OpcaoSemana>('12')

  const vet = useMemo(() => (dados ? calcularVET(dados, estado.equacao).vet : 0), [dados, estado.equacao])
  const ingerido = useMemo(() => somarCalorias(estado.escolhas, REFEICOES), [estado.escolhas])
  const balanco = useMemo(() => classificarBalanco(vet, ingerido), [vet, ingerido])
  const todasAusentes = useMemo(
    () => REFEICOES.every((r) => !estado.escolhas[r.id]),
    [estado.escolhas],
  )

  const projecao = useMemo(
    () => (dados ? projetarPeso(dados.pesoKg, balanco.diferenca, Number(semanas)) : null),
    [dados, balanco.diferenca, semanas],
  )

  if (!dados) {
    return (
      <div className="flex flex-col gap-4">
        <Callout tone="warn">Preencha seus dados antes de ver o balanço calórico.</Callout>
        <Button
          iconLeft={<ArrowLeft size={18} />}
          onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}
        >
          Começar pelos seus dados
        </Button>
      </div>
    )
  }

  if (todasAusentes) {
    return (
      <div className="flex flex-col gap-4">
        <Callout tone="warn">Você ainda não montou o dia alimentar.</Callout>
        <Button
          iconLeft={<ArrowLeft size={18} />}
          onClick={() => dispatch({ type: 'irPara', passo: 'refeicoes' })}
        >
          Montar o dia alimentar
        </Button>
      </div>
    )
  }

  const tom = TOM[balanco.classificacao]
  const maior = Math.max(ingerido, vet)

  function onEditarRefeicao(indice: number) {
    dispatch({ type: 'irParaRefeicao', indice })
    dispatch({ type: 'irPara', passo: 'refeicoes' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Você ingere cerca de{' '}
          <span className={`num ${TOM_TEXTO[balanco.classificacao]}`}>{formatarKcal(ingerido)}</span> por
          dia e gasta{' '}
          <span className={`num ${TOM_TEXTO[balanco.classificacao]}`}>{formatarKcal(vet)}</span>.
        </h1>

        <div className="mt-3">
          <Badge tone={TOM_BADGE[balanco.classificacao]} className="text-base px-4 py-1.5">
            {balanco.classificacao === 'deficit'
              ? `Déficit calórico de ${formatarKcal(Math.abs(balanco.diferenca))}/dia`
              : balanco.classificacao === 'superavit'
                ? `Superávit calórico de ${formatarKcal(Math.abs(balanco.diferenca))}/dia`
                : `Equilíbrio calórico (dentro de ±${formatarKcal(balanco.toleranciaKcal)})`}
          </Badge>
        </div>

        <p className="mt-2 text-sm text-ink-2">{EXPLICACAO[balanco.classificacao]}</p>
      </div>

      <Card>
        <CardTitle>Ingerido x gasto</CardTitle>
        <div className="mt-4 flex flex-col gap-4">
          <BarraComparativa
            rotulo="Ingerido"
            valor={ingerido}
            maior={maior}
            corBarra={TOM_BG[balanco.classificacao]}
          />
          <BarraComparativa rotulo="Gasto (VET)" valor={vet} maior={maior} corBarra="bg-surface-3" />
        </div>
      </Card>

      {projecao ? (
        <Card>
          <CardTitle>Se esse dia se repetir</CardTitle>

          <div className="mt-3">
            <SegmentedControl<OpcaoSemana>
              ariaLabel="Horizonte da projeção"
              value={semanas}
              onChange={setSemanas}
              options={OPCOES_SEMANA}
            />
          </div>

          <div className="mt-5">
            <ProjecaoChart pontos={projecao.pontos} tom={tom} pesoInicial={dados.pesoKg} />
          </div>

          <p className="font-display mt-4 text-lg font-semibold text-ink">
            Em {semanas} semanas:{' '}
            {balanco.classificacao === 'normocalorico' ? (
              <>tendência de manter {formatarKg(projecao.pesoFinalKg)}</>
            ) : (
              <>
                {formatarKg(projecao.pesoFinalKg)} ({formatarSinal(projecao.deltaKg, 1)} kg)
              </>
            )}
          </p>

          {projecao.ritmoAcelerado ? (
            <Callout tone="warn" className="mt-3">
              Ritmo acima de 1 kg por semana não é recomendado; esta é só uma estimativa.
            </Callout>
          ) : null}

          <p className="mt-4 flex items-start gap-1 text-xs text-ink-3">
            Estimativa linear simplificada: 7.700 kcal ≈ 1 kg de gordura corporal. Para uma simulação
            dinâmica, veja o{' '}
            <a
              href="https://www.niddk.nih.gov/bwp"
              target="_blank"
              rel="noreferrer"
              className="text-brand-ink underline"
            >
              Body Weight Planner do NIDDK
              <ExternalLink size={12} className="ml-0.5 inline-block align-[-1px]" />
            </a>
          </p>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Seu dia alimentar</CardTitle>
        <div className="mt-3">
          <ResumoRefeicoes escolhas={estado.escolhas} editavel onEditar={onEditarRefeicao} />
        </div>
      </Card>

      <div className="flex flex-wrap-reverse items-center justify-between gap-3">
        <Button
          variant="ghost"
          iconLeft={<ArrowLeft size={18} />}
          className="w-full sm:w-auto"
          onClick={() => dispatch({ type: 'irPara', passo: 'refeicoes' })}
        >
          Voltar às refeições
        </Button>
        <Button
          size="lg"
          iconRight={<FileText size={18} />}
          className="w-full sm:w-auto"
          onClick={() => dispatch({ type: 'irPara', passo: 'relatorio' })}
        >
          Gerar relatório
        </Button>
      </div>
    </div>
  )
}
