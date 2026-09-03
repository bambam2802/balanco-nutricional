import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, FileText, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import { calcularVET } from '../../domain/tmb'
import { somarCalorias, classificarBalanco } from '../../domain/balanco'
import { projetarPeso } from '../../domain/projecao'
import { projetarPesoHall, caloriasParaMeta, type EntradaHall } from '../../domain/hall'
import { formatarKcal, formatarKg, formatarNumero, formatarSinal, rotuloSemanas } from '../../domain/formatar'
import { REFEICOES } from '../../data/refeicoes'
import type { ClassificacaoBalanco } from '../../domain/types'
import type { BadgeTone } from '../ui/Badge'
import type { TomProjecao, SerieProjecao } from '../charts/ProjecaoChart'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Callout } from '../ui/Callout'
import { SegmentedControl } from '../ui/SegmentedControl'
import { NumberField } from '../ui/NumberField'
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

type OpcaoSemana = '4' | '12' | '24' | '52'

function rotuloHorizonte(op: OpcaoSemana): string {
  return rotuloSemanas(Number(op))
}

const OPCOES_SEMANA: { value: OpcaoSemana; label: string }[] = [
  { value: '4', label: rotuloHorizonte('4') },
  { value: '12', label: rotuloHorizonte('12') },
  { value: '24', label: rotuloHorizonte('24') },
  { value: '52', label: rotuloHorizonte('52') },
]

type OpcaoPrazoMeta = '12' | '24' | '52'

const OPCOES_PRAZO_META: { value: OpcaoPrazoMeta; label: string }[] = [
  { value: '12', label: rotuloHorizonte('12') },
  { value: '24', label: rotuloHorizonte('24') },
  { value: '52', label: rotuloHorizonte('52') },
]

/** Converte string com vírgula ou ponto decimal para número. `null` se inválido/vazio. */
function paraNumero(valor: string): number | null {
  const limpo = valor.trim().replace(',', '.')
  if (limpo === '') return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

function paraTexto(n: number | undefined): string {
  return n != null ? String(n).replace('.', ',') : ''
}

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

  const [metaAberta, setMetaAberta] = useState(estado.meta !== null)
  const [pesoAlvoStr, setPesoAlvoStr] = useState(() => paraTexto(estado.meta?.pesoKg ?? dados?.pesoKg))
  const [prazoMeta, setPrazoMeta] = useState<OpcaoPrazoMeta>(() =>
    estado.meta?.semanas === 12 || estado.meta?.semanas === 52 ? String(estado.meta.semanas) as OpcaoPrazoMeta : '24',
  )
  const [erroPesoAlvo, setErroPesoAlvo] = useState<string | undefined>(undefined)

  const resultadoVet = useMemo(() => (dados ? calcularVET(dados, estado.equacao) : null), [dados, estado.equacao])
  const vet = resultadoVet?.vet ?? 0
  const ingerido = useMemo(() => somarCalorias(estado.escolhas, REFEICOES), [estado.escolhas])
  const balanco = useMemo(() => classificarBalanco(vet, ingerido), [vet, ingerido])
  const todasAusentes = useMemo(
    () => REFEICOES.every((r) => !estado.escolhas[r.id]),
    [estado.escolhas],
  )

  const entradaHall = useMemo<EntradaHall | null>(() => {
    if (!dados || !resultadoVet) return null
    return {
      sexo: dados.sexo,
      idade: dados.idade,
      pesoKg: dados.pesoKg,
      alturaCm: dados.alturaCm,
      tmbKcal: resultadoVet.tmb,
      vetKcal: resultadoVet.vet,
      gorduraPct: dados.gorduraPct,
    }
  }, [dados, resultadoVet])

  const projecaoHall = useMemo(
    () => (entradaHall ? projetarPesoHall(entradaHall, ingerido, Number(semanas)) : null),
    [entradaHall, ingerido, semanas],
  )

  const projecaoLinear = useMemo(
    () => (dados ? projetarPeso(dados.pesoKg, balanco.diferenca, Number(semanas)) : null),
    [dados, balanco.diferenca, semanas],
  )

  const seriesProjecao = useMemo<SerieProjecao[]>(() => {
    if (!projecaoHall || !projecaoLinear) return []
    return [
      { id: 'hall', rotulo: 'Modelo dinâmico', pontos: projecaoHall.pontos, tom: TOM[balanco.classificacao], estilo: 'solida' },
      {
        id: 'linear',
        rotulo: 'Regra simples (7.700 kcal = 1 kg)',
        pontos: projecaoLinear.pontos,
        tom: 'neutro',
        estilo: 'tracejada',
      },
    ]
  }, [projecaoHall, projecaoLinear, balanco.classificacao])

  const pesoAlvoNum = useMemo(() => paraNumero(pesoAlvoStr), [pesoAlvoStr])

  const resultadoMeta = useMemo(() => {
    if (!entradaHall || pesoAlvoNum === null || pesoAlvoNum < 20 || pesoAlvoNum > 300) return null
    return caloriasParaMeta(entradaHall, pesoAlvoNum, Number(prazoMeta))
  }, [entradaHall, pesoAlvoNum, prazoMeta])

  useEffect(() => {
    if (!metaAberta || pesoAlvoNum === null || pesoAlvoNum < 20 || pesoAlvoNum > 300) return
    dispatch({ type: 'definirMeta', meta: { pesoKg: pesoAlvoNum, semanas: Number(prazoMeta) } })
  }, [metaAberta, pesoAlvoNum, prazoMeta, dispatch])

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

  const maior = Math.max(ingerido, vet)

  function onEditarRefeicao(indice: number) {
    dispatch({ type: 'irParaRefeicao', indice })
    dispatch({ type: 'irPara', passo: 'refeicoes' })
  }

  function validarPesoAlvo() {
    if (pesoAlvoNum === null || pesoAlvoNum < 20 || pesoAlvoNum > 300) {
      setErroPesoAlvo('Informe o peso-alvo em quilos, entre 20 e 300')
    } else {
      setErroPesoAlvo(undefined)
    }
  }

  function removerMeta() {
    dispatch({ type: 'definirMeta', meta: null })
    setMetaAberta(false)
    setPesoAlvoStr(paraTexto(dados?.pesoKg))
    setPrazoMeta('24')
    setErroPesoAlvo(undefined)
  }

  const diffMetaKcal =
    resultadoMeta?.alcancavel && resultadoMeta.kcalDia != null ? Math.round(resultadoMeta.kcalDia) - ingerido : null

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

      {projecaoHall && projecaoLinear ? (
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
            <ProjecaoChart series={seriesProjecao} pesoInicial={dados.pesoKg} semanasRotulo={Number(semanas)} />
          </div>

          <p className="font-display mt-4 text-lg font-semibold text-ink">
            Em {rotuloHorizonte(semanas)}:{' '}
            {balanco.classificacao === 'normocalorico' ? (
              <>
                tendência de manter <span className="num">{formatarKg(projecaoHall.pesoFinalKg)}</span>
              </>
            ) : (
              <>
                <span className="num">{formatarKg(projecaoHall.pesoFinalKg)}</span> (
                <span className="num">{formatarSinal(projecaoHall.deltaKg, 1)} kg</span>)
              </>
            )}{' '}
            pelo modelo dinâmico
          </p>
          <p className="mt-1 text-sm text-ink-2">
            Regra simples: <span className="num">{formatarKg(projecaoLinear.pesoFinalKg)}</span>
          </p>

          {projecaoHall.ritmoAcelerado ? (
            <Callout tone="warn" className="mt-3">
              Ritmo acima de 1 kg por semana não é recomendado; esta é só uma estimativa.
            </Callout>
          ) : null}

          <p className="mt-3 text-sm text-ink-2">
            Gordura corporal {dados.gorduraPct != null ? 'medida' : 'estimada'}:{' '}
            <span className="num">{formatarNumero(projecaoHall.gorduraPctInicial, 0)}%</span> →{' '}
            <span className="num">{formatarNumero(projecaoHall.gorduraPctFinal, 0)}%</span>
          </p>

          <p className="mt-2 text-sm text-ink-2">
            O corpo se adapta: quanto menos você pesa, menos gasta, por isso a mudança desacelera com o
            tempo.
          </p>

          <p className="mt-4 text-xs text-ink-3">
            Modelo de Hall et al. (2011), o mesmo do{' '}
            <a
              href="https://www.niddk.nih.gov/bwp"
              target="_blank"
              rel="noreferrer"
              className="text-brand-ink underline"
            >
              Body Weight Planner do NIDDK
              <ExternalLink size={12} className="ml-0.5 inline-block align-[-1px]" />
            </a>
            . Estimativa educativa.
            {dados.idade < 18 ? ' Estimativa de gordura corporal feita para adultos.' : ''}
          </p>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Meta</CardTitle>
          {metaAberta ? (
            <Button variant="ghost" onClick={removerMeta}>
              Remover meta
            </Button>
          ) : null}
        </div>

        {!metaAberta ? (
          <div className="mt-3">
            <p className="text-sm text-ink-2">E se você tiver uma meta?</p>
            <Button
              variant="secondary"
              className="mt-3"
              iconLeft={<Target size={18} />}
              onClick={() => setMetaAberta(true)}
            >
              Definir meta de peso
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberField
                label="Peso-alvo"
                unit="kg"
                inputMode="decimal"
                min={20}
                max={300}
                value={pesoAlvoStr}
                onChange={setPesoAlvoStr}
                onBlur={validarPesoAlvo}
                error={erroPesoAlvo}
              />
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-2">Prazo</span>
                <SegmentedControl<OpcaoPrazoMeta>
                  ariaLabel="Prazo da meta"
                  full
                  value={prazoMeta}
                  onChange={setPrazoMeta}
                  options={OPCOES_PRAZO_META}
                />
              </div>
            </div>

            {resultadoMeta ? (
              <div>
                {!resultadoMeta.alcancavel ? (
                  <Callout tone="warn">
                    Essa meta não é alcançável nesse prazo, nem com ingestão zero. Tente um prazo maior.
                  </Callout>
                ) : pesoAlvoNum === dados.pesoKg ? (
                  <p className="font-display text-base font-semibold text-ink sm:text-lg">
                    Para manter o peso atual: cerca de{' '}
                    <span className="num">{formatarKcal(Math.round(resultadoMeta.kcalDia!))}</span>/dia
                  </p>
                ) : (
                  <>
                    <p className="font-display text-base font-semibold text-ink sm:text-lg">
                      Para chegar a <span className="num">{formatarKg(pesoAlvoNum!)}</span> em{' '}
                      {rotuloHorizonte(prazoMeta)}: cerca de{' '}
                      <span className="num">{formatarKcal(Math.round(resultadoMeta.kcalDia!))}</span>/dia
                    </p>
                    <p className="mt-1 text-sm text-ink-2">
                      Depois, para manter <span className="num">{formatarKg(pesoAlvoNum!)}</span>: cerca de{' '}
                      <span className="num">{formatarKcal(Math.round(resultadoMeta.kcalManterAlvo!))}</span>
                      /dia
                    </p>
                  </>
                )}

                {resultadoMeta.alcancavel && diffMetaKcal !== null ? (
                  <p className="mt-2 text-sm text-ink-2">
                    Hoje você ingere cerca de <span className="num">{formatarKcal(ingerido)}</span> por dia
                    {diffMetaKcal === 0 ? (
                      ', exatamente o necessário'
                    ) : (
                      <>
                        , <span className="num">{formatarKcal(Math.abs(diffMetaKcal))}</span>{' '}
                        {diffMetaKcal < 0 ? 'a mais' : 'a menos'} que o necessário
                      </>
                    )}
                    .
                  </p>
                ) : null}

                {resultadoMeta.abaixoSeguro ? (
                  <Callout tone="warn" className="mt-3">
                    Abaixo de 1.000 kcal por dia não é seguro sem acompanhamento profissional.
                  </Callout>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </Card>

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
