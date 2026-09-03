import type { DadosPessoa, ResultadoCintura, ResultadoRCQ, ResultadoRiscoCV, Sexo } from './types'

/** Pontos de corte de circunferência da cintura (cm) por sexo — OMS. */
const CORTES_CINTURA: Record<Sexo, { aumentado: number; muitoAumentado: number }> = {
  feminino: { aumentado: 80, muitoAumentado: 88 },
  masculino: { aumentado: 94, muitoAumentado: 102 },
}

/** Pontos de corte de RCQ (relação cintura-quadril) por sexo — OMS. */
const CORTES_RCQ: Record<Sexo, number> = {
  feminino: 0.85,
  masculino: 0.9,
}

/** Classifica o risco cardiovascular pela circunferência da cintura (OMS). */
export function classificarCintura(cinturaCm: number, sexo: Sexo): ResultadoCintura {
  const cortes = CORTES_CINTURA[sexo]

  const nivel =
    cinturaCm >= cortes.muitoAumentado
      ? 'muito_aumentado'
      : cinturaCm >= cortes.aumentado
        ? 'aumentado'
        : 'normal'

  const rotulo =
    nivel === 'muito_aumentado'
      ? 'Risco muito aumentado'
      : nivel === 'aumentado'
        ? 'Risco aumentado'
        : 'Sem risco aumentado'

  return { valorCm: cinturaCm, nivel, rotulo, cortes }
}

/** RCQ = cintura / quadril. */
export function calcularRCQ(cinturaCm: number, quadrilCm: number): number {
  return cinturaCm / quadrilCm
}

/** Classifica o risco cardiovascular pela RCQ (OMS): mulher > 0,85, homem > 0,90. */
export function classificarRCQ(rcq: number, sexo: Sexo): ResultadoRCQ {
  const corte = CORTES_RCQ[sexo]
  const risco = rcq > corte
  const rotulo = risco ? 'Risco aumentado' : 'Sem risco aumentado'
  return { valor: rcq, risco, rotulo, corte }
}

/**
 * Avalia o risco cardiovascular geral. `cintura` é `null` se `cinturaCm` não
 * foi informado; `rcq` é `null` se `cinturaCm` OU `quadrilCm` não foram informados.
 */
export function avaliarRiscoCV(dados: DadosPessoa): ResultadoRiscoCV {
  const { sexo, cinturaCm, quadrilCm } = dados

  const cintura = cinturaCm != null ? classificarCintura(cinturaCm, sexo) : null

  const rcq =
    cinturaCm != null && quadrilCm != null
      ? classificarRCQ(calcularRCQ(cinturaCm, quadrilCm), sexo)
      : null

  return { cintura, rcq }
}
