import { ArrowLeft, Printer, RotateCcw } from 'lucide-react'
import { useMemo } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import { calcularVET } from '../../domain/tmb'
import { calcularIMC, classificarIMC } from '../../domain/imc'
import { avaliarRiscoCV } from '../../domain/riscoCardio'
import { somarCalorias, classificarBalanco } from '../../domain/balanco'
import { projetarPeso } from '../../domain/projecao'
import { formatarKcal, formatarKg, formatarNumero, formatarSinal } from '../../domain/formatar'
import { REFEICOES } from '../../data/refeicoes'
import { EQUACOES } from '../../data/equacoes'
import { NIVEIS_ATIVIDADE } from '../../data/atividade'
import type { ClassificacaoBalanco, ClassificacaoIMC, NivelRiscoCintura } from '../../domain/types'
import type { BadgeTone } from '../ui/Badge'
import type { TomProjecao } from '../charts/ProjecaoChart'
import { CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Callout } from '../ui/Callout'
import { Button } from '../ui/Button'
import { ProjecaoChart } from '../charts/ProjecaoChart'
import { ResumoRefeicoes } from './ResumoRefeicoes'
import './relatorio.css'

const SEMANAS_RELATORIO = 12

const TOM_BADGE: Record<ClassificacaoBalanco, BadgeTone> = {
  deficit: 'deficit',
  normocalorico: 'normo',
  superavit: 'superavit',
}

const TOM_PROJECAO: Record<ClassificacaoBalanco, TomProjecao> = {
  deficit: 'deficit',
  normocalorico: 'normo',
  superavit: 'superavit',
}

const EXPLICACAO: Record<ClassificacaoBalanco, string> = {
  deficit: 'Come menos do que gasta: tendência de perder peso ao longo das semanas.',
  normocalorico: 'Come e gasta em equilíbrio: tendência de manter o peso.',
  superavit: 'Come mais do que gasta: tendência de ganhar peso.',
}

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

function CampoResumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-3">{rotulo}</p>
      <p className="num mt-0.5 text-sm font-medium text-ink">{valor}</p>
    </div>
  )
}

export function Relatorio() {
  const { estado, dispatch } = useAvaliacao()
  const dados = estado.dados

  const vet = useMemo(() => (dados ? calcularVET(dados, estado.equacao) : null), [dados, estado.equacao])
  const imc = useMemo(
    () => (dados ? classificarIMC(calcularIMC(dados.pesoKg, dados.alturaCm), dados.idade) : null),
    [dados],
  )
  const risco = useMemo(() => (dados ? avaliarRiscoCV(dados) : null), [dados])
  const ingerido = useMemo(() => somarCalorias(estado.escolhas, REFEICOES), [estado.escolhas])
  const balanco = useMemo(
    () => (vet ? classificarBalanco(vet.vet, ingerido) : null),
    [vet, ingerido],
  )
  const projecao = useMemo(
    () => (dados && balanco ? projetarPeso(dados.pesoKg, balanco.diferenca, SEMANAS_RELATORIO) : null),
    [dados, balanco],
  )

  if (!dados || !vet || !imc || !risco || !balanco || !projecao) {
    return (
      <div className="flex flex-col gap-4">
        <Callout tone="warn">Preencha seus dados antes de gerar o relatório.</Callout>
        <Button
          iconLeft={<ArrowLeft size={18} />}
          onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}
        >
          Começar pelos seus dados
        </Button>
      </div>
    )
  }

  const equacaoInfo = EQUACOES.find((e) => e.id === estado.equacao)!
  const nivelAtividadeInfo = NIVEIS_ATIVIDADE.find((n) => n.id === dados.atividade)!
  const rotuloSexo = dados.sexo === 'feminino' ? 'Feminino' : 'Masculino'
  const alturaM = formatarNumero(dados.alturaCm / 100, 2)
  const dataExtenso = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const camposDados: { rotulo: string; valor: string }[] = [
    { rotulo: 'Sexo', valor: rotuloSexo },
    { rotulo: 'Idade', valor: `${dados.idade} anos` },
    { rotulo: 'Peso', valor: formatarKg(dados.pesoKg) },
    { rotulo: 'Altura', valor: `${alturaM} m` },
    { rotulo: 'Atividade física', valor: nivelAtividadeInfo.rotulo },
  ]
  if (dados.cinturaCm != null) camposDados.push({ rotulo: 'Cintura', valor: `${formatarNumero(dados.cinturaCm, 0)} cm` })
  if (dados.quadrilCm != null) camposDados.push({ rotulo: 'Quadril', valor: `${formatarNumero(dados.quadrilCm, 0)} cm` })

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            iconLeft={<ArrowLeft size={18} />}
            onClick={() => dispatch({ type: 'irPara', passo: 'balanco' })}
          >
            Voltar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" iconLeft={<RotateCcw size={18} />} onClick={() => dispatch({ type: 'novaAvaliacao' })}>
            Nova avaliação
          </Button>
          <Button iconLeft={<Printer size={18} />} onClick={() => window.print()}>
            Imprimir / salvar PDF
          </Button>
        </div>
      </div>
      <p className="no-print -mt-3 text-xs text-ink-3">
        Na caixa de impressão, escolha &quot;Salvar como PDF&quot; para enviar pelo celular.
      </p>

      <div className="relatorio-papel mx-auto w-full max-w-3xl rounded-card border border-border bg-white p-6 sm:p-10">
        <header className="relatorio-secao border-b border-border pb-5">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Balanço Nutricional</h1>
          <p className="mt-1 text-sm text-ink-2">{dataExtenso}</p>
          <p className="text-sm text-ink-3">Curso de Nutrição — feira</p>
        </header>

        <section className="relatorio-secao mt-6">
          <CardTitle>Dados</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {camposDados.map((c) => (
              <CampoResumo key={c.rotulo} rotulo={c.rotulo} valor={c.valor} />
            ))}
          </div>
        </section>

        <section className="relatorio-secao mt-6 border-t border-border pt-6">
          <CardTitle>Resultados</CardTitle>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-3">Gasto energético (VET)</p>
              <p className="num mt-0.5 text-lg font-semibold text-ink">{formatarKcal(vet.vet)}</p>
              <p className="num mt-0.5 text-xs text-ink-3">
                TMB {formatarKcal(vet.tmb)} × fator {formatarNumero(vet.fator, 3)} · {equacaoInfo.rotulo}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-ink-3">IMC</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="num text-lg font-semibold text-ink">{formatarNumero(imc.imc, 1)}</span>
                <Badge tone={TOM_IMC[imc.classificacao]}>{imc.rotulo}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-3">
                {imc.classificacao === 'sem_classificacao'
                  ? 'Menor de 18 anos: sem classificação por esta ferramenta'
                  : imc.protocolo === 'lipschitz_idoso'
                    ? 'Classificação para idosos (60+) — Lipschitz, 1994'
                    : 'Classificação para adultos — OMS'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-ink-3">Cintura</p>
              {risco.cintura ? (
                <>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="num text-lg font-semibold text-ink">
                      {formatarNumero(risco.cintura.valorCm, 0)} cm
                    </span>
                    <Badge tone={TOM_CINTURA[risco.cintura.nivel]}>{risco.cintura.rotulo}</Badge>
                  </div>
                  <p className="num mt-0.5 text-xs text-ink-3">
                    OMS: ≥ {risco.cintura.cortes.aumentado} cm aumentado · ≥ {risco.cintura.cortes.muitoAumentado} cm muito aumentado
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm italic text-ink-3">Não informado</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-ink-3">Relação cintura/quadril</p>
              {risco.rcq ? (
                <>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="num text-lg font-semibold text-ink">{formatarNumero(risco.rcq.valor, 2)}</span>
                    <Badge tone={risco.rcq.risco ? 'danger' : 'ok'}>{risco.rcq.rotulo}</Badge>
                  </div>
                  <p className="num mt-0.5 text-xs text-ink-3">
                    OMS: {dados.sexo === 'feminino' ? 'mulher' : 'homem'} &gt; {formatarNumero(risco.rcq.corte, 2)}
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm italic text-ink-3">Não informado</p>
              )}
            </div>
          </div>
        </section>

        <section className="relatorio-secao relatorio-secao--fluida mt-6 border-t border-border pt-6">
          <CardTitle>Dia alimentar</CardTitle>
          <div className="mt-3">
            <ResumoRefeicoes escolhas={estado.escolhas} />
          </div>
        </section>

        <section className="relatorio-secao mt-6 border-t border-border pt-6">
          <CardTitle>Balanço calórico</CardTitle>
          <p className="font-display mt-2 text-lg font-semibold text-ink sm:text-xl">
            Ingere cerca de <span className="num">{formatarKcal(ingerido)}</span> por dia e gasta{' '}
            <span className="num">{formatarKcal(vet.vet)}</span>.
          </p>
          <div className="mt-2">
            <Badge tone={TOM_BADGE[balanco.classificacao]}>
              {balanco.classificacao === 'deficit'
                ? `Déficit calórico de ${formatarKcal(Math.abs(balanco.diferenca))}/dia`
                : balanco.classificacao === 'superavit'
                  ? `Superávit calórico de ${formatarKcal(Math.abs(balanco.diferenca))}/dia`
                  : `Equilíbrio calórico (dentro de ±${formatarKcal(balanco.toleranciaKcal)})`}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-ink-2">{EXPLICACAO[balanco.classificacao]}</p>
        </section>

        <section className="relatorio-secao mt-6 border-t border-border pt-6">
          <CardTitle>Projeção de peso (12 semanas)</CardTitle>
          <div className="relatorio-svg mt-3">
            <ProjecaoChart
              pontos={projecao.pontos}
              tom={TOM_PROJECAO[balanco.classificacao]}
              pesoInicial={dados.pesoKg}
            />
          </div>
          <p className="font-display mt-3 text-base font-semibold text-ink">
            Em {SEMANAS_RELATORIO} semanas:{' '}
            {balanco.classificacao === 'normocalorico'
              ? `tendência de manter ${formatarKg(projecao.pesoFinalKg)}`
              : `${formatarKg(projecao.pesoFinalKg)} (${formatarSinal(projecao.deltaKg, 1)} kg)`}
          </p>
          {projecao.ritmoAcelerado ? (
            <p className="mt-2 text-sm text-warn">
              Ritmo acima de 1 kg por semana não é recomendado; esta é só uma estimativa.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-ink-3">
            Estimativa linear simplificada: 7.700 kcal ≈ 1 kg de gordura corporal. Para uma simulação
            dinâmica, veja o Body Weight Planner do NIDDK: https://www.niddk.nih.gov/bwp
          </p>
        </section>

        <footer className="relatorio-secao mt-8 border-t border-border pt-5 text-sm text-ink-3">
          <p>Ferramenta educativa. Não substitui avaliação com nutricionista.</p>
          <p className="mt-4">Atendido por: ______________________________________</p>
        </footer>
      </div>
    </div>
  )
}
