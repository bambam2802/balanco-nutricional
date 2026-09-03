import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { PontoProjecao } from '../../domain/types'
import { formatarKg, formatarNumero } from '../../domain/formatar'

export type TomProjecao = 'deficit' | 'normo' | 'superavit'

export interface ProjecaoChartProps {
  pontos: PontoProjecao[]
  tom: TomProjecao
  pesoInicial: number
}

const TOM_TEXTO: Record<TomProjecao, string> = {
  deficit: 'text-deficit',
  normo: 'text-normo',
  superavit: 'text-superavit',
}

const MARGEM_ESQ = 46
const MARGEM_DIR = 16
const MARGEM_TOPO = 16
const MARGEM_BASE = 30
const LARGURA_PADRAO = 640

/** Dimensões em px reais: o viewBox acompanha a largura do container para o texto não encolher no celular. */
function dimensoes(largura: number) {
  const LARGURA = Math.max(300, Math.round(largura))
  const ALTURA = Math.round(Math.min(260, Math.max(180, LARGURA * 0.42)))
  return {
    LARGURA,
    ALTURA,
    PLOT_X0: MARGEM_ESQ,
    PLOT_X1: LARGURA - MARGEM_DIR,
    PLOT_Y0: MARGEM_TOPO,
    PLOT_Y1: ALTURA - MARGEM_BASE,
  }
}

const NUM_TICKS_Y = 5

/** Passo entre rótulos do eixo X, mantendo no máximo ~7 rótulos visíveis. */
function passoEixoX(semanas: number): number {
  if (semanas <= 5) return 1
  const bruto = Math.ceil(semanas / 6)
  return Math.ceil(bruto / 4) * 4
}

export function ProjecaoChart({ pontos, tom, pesoInicial }: ProjecaoChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [larguraContainer, setLarguraContainer] = useState(LARGURA_PADRAO)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entradas) => {
      const w = entradas[0]?.contentRect.width
      if (w && w > 0) setLarguraContainer(w)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { LARGURA, ALTURA, PLOT_X0, PLOT_X1, PLOT_Y0, PLOT_Y1 } = dimensoes(larguraContainer)
  const semanas = pontos[pontos.length - 1]?.semana ?? 0
  const pesos = pontos.map((p) => p.pesoKg)
  const min = Math.min(...pesos, pesoInicial)
  const max = Math.max(...pesos, pesoInicial)
  const plano = max - min < 0.1
  const folga = plano ? 2 : 1
  const domainMin = Math.max(0, min - folga)
  const domainMax = max + folga

  const x = (semana: number) =>
    PLOT_X0 + (semanas === 0 ? 0 : (semana / semanas) * (PLOT_X1 - PLOT_X0))
  const y = (peso: number) =>
    PLOT_Y1 - ((peso - domainMin) / (domainMax - domainMin || 1)) * (PLOT_Y1 - PLOT_Y0)

  const ticksY = Array.from(
    { length: NUM_TICKS_Y },
    (_, i) => domainMin + (i * (domainMax - domainMin)) / (NUM_TICKS_Y - 1),
  )

  const passo = passoEixoX(semanas)
  const ticksX: number[] = []
  for (let s = 0; s <= semanas; s += passo) ticksX.push(s)
  if (ticksX[ticksX.length - 1] !== semanas) ticksX.push(semanas)

  const pontosSvg = pontos.map((p) => `${x(p.semana).toFixed(1)},${y(p.pesoKg).toFixed(1)}`)
  const caminhoLinha = `M ${pontosSvg.join(' L ')}`
  const caminhoArea = `M ${x(0).toFixed(1)},${PLOT_Y1} L ${pontosSvg.join(' L ')} L ${x(semanas).toFixed(1)},${PLOT_Y1} Z`

  const ultimo = pontos[pontos.length - 1]
  const yBase = y(pesoInicial)

  return (
    <div ref={containerRef} className="w-full">
    <svg
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      className="h-auto w-full"
      style={{ fontFamily: 'inherit' }}
      role="img"
      aria-label={`Projeção de peso ao longo de ${semanas} semanas: de ${formatarKg(pesoInicial)} para ${formatarKg(ultimo.pesoKg)}`}
    >
      {ticksY.map((t) => (
        <g key={t}>
          <line
            x1={PLOT_X0}
            x2={PLOT_X1}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text
            x={PLOT_X0 - 8}
            y={y(t)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            className="num"
            fill="var(--color-ink-3)"
          >
            {formatarNumero(t, 1)}
          </text>
        </g>
      ))}

      {ticksX.map((s) => (
        <text
          key={s}
          x={x(s)}
          y={PLOT_Y1 + 20}
          textAnchor="middle"
          fontSize={11}
          className="num"
          fill="var(--color-ink-3)"
        >
          {s}
        </text>
      ))}

      <line
        x1={PLOT_X0}
        x2={PLOT_X1}
        y1={yBase}
        y2={yBase}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      <path d={caminhoArea} className={TOM_TEXTO[tom]} fill="currentColor" opacity={0.1} stroke="none" />

      <motion.path
        d={caminhoLinha}
        className={TOM_TEXTO[tom]}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <circle cx={x(ultimo.semana)} cy={y(ultimo.pesoKg)} r={4} className={TOM_TEXTO[tom]} fill="currentColor" />
      <text
        x={x(ultimo.semana)}
        y={y(ultimo.pesoKg) - 10}
        textAnchor="end"
        fontSize={12}
        fontWeight={600}
        className={`num ${TOM_TEXTO[tom]}`}
        fill="currentColor"
      >
        {formatarKg(ultimo.pesoKg)}
      </text>
    </svg>
    </div>
  )
}
