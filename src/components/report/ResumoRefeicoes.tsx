import { Pencil } from 'lucide-react'
import { REFEICOES } from '../../data/refeicoes'
import type { Escolhas } from '../../domain/types'
import { formatarKcal } from '../../domain/formatar'

export interface ResumoRefeicoesProps {
  escolhas: Escolhas
  /** Quando true, cada linha é clicável para editar a escolha daquela refeição. */
  editavel?: boolean
  onEditar?: (indice: number) => void
}

interface LinhaRefeicao {
  nome: string
  texto: string
  foto: string | null
  kcal: number
  destacado: boolean
}

function montarLinha(refeicao: (typeof REFEICOES)[number], escolhas: Escolhas): LinhaRefeicao {
  const escolha = escolhas[refeicao.id]

  if (!escolha) {
    return { nome: refeicao.nome, texto: 'Não respondido', foto: null, kcal: 0, destacado: true }
  }

  if (escolha.tipo === 'nao_faco') {
    return { nome: refeicao.nome, texto: 'Não faz esta refeição', foto: null, kcal: 0, destacado: true }
  }

  const opcao = refeicao.opcoes.find((o) => o.id === escolha.opcaoId)
  if (!opcao) {
    return { nome: refeicao.nome, texto: 'Não respondido', foto: null, kcal: 0, destacado: true }
  }

  return { nome: refeicao.nome, texto: opcao.nome, foto: opcao.foto, kcal: opcao.kcal, destacado: false }
}

export function ResumoRefeicoes({ escolhas, editavel = false, onEditar }: ResumoRefeicoesProps) {
  const linhas = REFEICOES.map((refeicao) => montarLinha(refeicao, escolhas))
  const total = linhas.reduce((soma, l) => soma + l.kcal, 0)

  return (
    <div className="flex flex-col">
      {linhas.map((linha, indice) => {
        const conteudo = (
          <>
            <span className="hidden w-32 shrink-0 text-sm text-ink-2 sm:block sm:w-36">{linha.nome}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              {linha.foto ? (
                <img
                  src={linha.foto}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-ink-3 sm:hidden">{linha.nome}</span>
              <span
                className={[
                  'line-clamp-2 text-sm',
                  linha.destacado ? 'italic text-ink-3' : 'text-ink',
                ].join(' ')}
              >
                {linha.texto}
              </span>
            </span>
            <span className="num w-20 shrink-0 text-right text-sm text-ink-2 sm:w-24">
              {linha.kcal > 0 ? formatarKcal(linha.kcal) : '—'}
            </span>
            {editavel ? (
              <span className="flex w-4 shrink-0 justify-end">
                <Pencil size={14} className="text-ink-3" />
              </span>
            ) : null}
          </>
        )

        if (editavel) {
          return (
            <button
              key={linha.nome}
              type="button"
              onClick={() => onEditar?.(indice)}
              className="resumo-linha flex items-center gap-3 border-b border-border py-3 text-left last:border-b-0 hover:bg-surface-2"
            >
              {conteudo}
            </button>
          )
        }

        return (
          <div key={linha.nome} className="resumo-linha flex items-center gap-3 border-b border-border py-3 last:border-b-0">
            {conteudo}
          </div>
        )
      })}

      <div className="resumo-linha flex items-center gap-3 pt-3">
        <span className="hidden w-32 shrink-0 text-sm font-semibold text-ink sm:block sm:w-36">Total</span>
        <span className="hidden h-10 w-10 shrink-0 sm:block" />
        <span className="min-w-0 flex-1 text-sm font-semibold text-ink sm:hidden">Total</span>
        <span className="hidden min-w-0 flex-1 sm:block" />
        <span className="num w-20 shrink-0 text-right text-sm font-semibold text-ink sm:w-24">
          {formatarKcal(total)}
        </span>
        {editavel ? <span className="w-4 shrink-0" /> : null}
      </div>
    </div>
  )
}
