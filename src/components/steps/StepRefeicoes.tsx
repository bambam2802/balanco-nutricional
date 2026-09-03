import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import { calcularVET } from '../../domain/tmb'
import { somarCalorias } from '../../domain/balanco'
import { REFEICOES } from '../../data/refeicoes'
import type { Escolha } from '../../domain/types'
import { Button } from '../ui/Button'
import { Callout } from '../ui/Callout'
import { MealDots } from '../meals/MealDots'
import { MealScreen } from '../meals/MealScreen'
import { StickyTotal } from '../meals/StickyTotal'

export function StepRefeicoes() {
  const { estado, dispatch } = useAvaliacao()
  const dados = estado.dados

  const vet = useMemo(() => (dados ? calcularVET(dados, estado.equacao).vet : 0), [dados, estado.equacao])
  const acumulado = useMemo(() => somarCalorias(estado.escolhas, REFEICOES), [estado.escolhas])

  if (!dados) {
    return (
      <div className="flex flex-col gap-4">
        <Callout tone="warn">Preencha seus dados antes de montar o dia alimentar.</Callout>
        <Button
          variant="secondary"
          iconLeft={<ArrowLeft size={18} />}
          onClick={() => dispatch({ type: 'irPara', passo: 'dados' })}
        >
          Começar pelos seus dados
        </Button>
      </div>
    )
  }

  const indice = estado.refeicaoAtual
  const refeicao = REFEICOES[indice]
  const escolha = estado.escolhas[refeicao.id]
  const primeira = indice === 0
  const ultima = indice === REFEICOES.length - 1

  function selecionar(escolha: Escolha) {
    dispatch({ type: 'escolher', refeicao: refeicao.id, escolha })
  }

  function irParaIndice(i: number) {
    dispatch({ type: 'irParaRefeicao', indice: i })
  }

  function avancar() {
    if (ultima) {
      dispatch({ type: 'irPara', passo: 'balanco' })
      return
    }
    irParaIndice(indice + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function voltar() {
    if (primeira) {
      dispatch({ type: 'irPara', passo: 'resultados' })
      return
    }
    irParaIndice(indice - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-6 pb-36 sm:pb-28">
      <MealDots refeicoes={REFEICOES} atual={indice} escolhas={estado.escolhas} onSelect={irParaIndice} />

      <div style={{ clipPath: 'inset(0)' }}>
        <AnimatePresence mode="wait">
          <MealScreen
            key={refeicao.id}
            refeicao={refeicao}
            indice={indice}
            total={REFEICOES.length}
            escolha={escolha}
            onEscolher={selecionar}
          />
        </AnimatePresence>
      </div>

      <StickyTotal
        acumulado={acumulado}
        vet={vet}
        onVoltar={voltar}
        onAvancar={avancar}
        avancarDesabilitado={!escolha}
        isUltima={ultima}
      />
    </div>
  )
}
