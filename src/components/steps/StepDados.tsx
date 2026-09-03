import { ArrowRight, Check } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAvaliacao } from '../../state/avaliacao'
import type { DadosPessoa, NivelAtividade, Sexo } from '../../domain/types'
import { NIVEIS_ATIVIDADE } from '../../data/atividade'
import { formatarNumero } from '../../domain/formatar'
import { Card, CardTitle } from '../ui/Card'
import { SegmentedControl } from '../ui/SegmentedControl'
import { NumberField } from '../ui/NumberField'
import { Callout } from '../ui/Callout'
import { Button } from '../ui/Button'

interface FormularioDados {
  sexo: Sexo | ''
  idade: string
  pesoKg: string
  alturaCm: string
  atividade: NivelAtividade
  cinturaCm: string
  quadrilCm: string
  gorduraPct: string
}

type CamposObrigatorios = 'sexo' | 'idade' | 'pesoKg' | 'alturaCm'
type Erros = Partial<Record<keyof FormularioDados, string>>

function paraFormulario(dados: DadosPessoa | null): FormularioDados {
  if (!dados) {
    return {
      sexo: '',
      idade: '',
      pesoKg: '',
      alturaCm: '',
      atividade: 'leve',
      cinturaCm: '',
      quadrilCm: '',
      gorduraPct: '',
    }
  }
  return {
    sexo: dados.sexo,
    idade: String(dados.idade),
    pesoKg: String(dados.pesoKg).replace('.', ','),
    alturaCm: String(dados.alturaCm),
    atividade: dados.atividade,
    cinturaCm: dados.cinturaCm != null ? String(dados.cinturaCm) : '',
    quadrilCm: dados.quadrilCm != null ? String(dados.quadrilCm) : '',
    gorduraPct: dados.gorduraPct != null ? String(dados.gorduraPct).replace('.', ',') : '',
  }
}

/** Converte string com vírgula ou ponto decimal para número. `null` se inválido/vazio. */
function paraNumero(valor: string): number | null {
  const limpo = valor.trim().replace(',', '.')
  if (limpo === '') return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

function validarCampo(campo: keyof FormularioDados, form: FormularioDados): string | undefined {
  if (campo === 'sexo') {
    return form.sexo === '' ? 'Selecione uma opção' : undefined
  }

  if (campo === 'idade') {
    const n = paraNumero(form.idade)
    if (n === null) return 'Informe a idade em anos'
    if (!Number.isInteger(n) || n < 10 || n > 110) return 'Informe a idade em anos, entre 10 e 110'
    return undefined
  }

  if (campo === 'pesoKg') {
    const n = paraNumero(form.pesoKg)
    if (n === null) return 'Informe o peso em quilos'
    if (n < 20 || n > 300) return 'Informe o peso em quilos, entre 20 e 300'
    return undefined
  }

  if (campo === 'alturaCm') {
    const n = paraNumero(form.alturaCm)
    if (n === null) return 'Informe a altura em centímetros'
    if (n < 100 || n > 250) return 'Informe a altura em centímetros, entre 100 e 250'
    return undefined
  }

  if (campo === 'cinturaCm') {
    if (form.cinturaCm.trim() === '') return undefined
    const n = paraNumero(form.cinturaCm)
    if (n === null || n < 40 || n > 200) return 'Informe a cintura em centímetros, entre 40 e 200'
    return undefined
  }

  if (campo === 'quadrilCm') {
    if (form.quadrilCm.trim() === '') return undefined
    const n = paraNumero(form.quadrilCm)
    if (n === null || n < 40 || n > 200) return 'Informe o quadril em centímetros, entre 40 e 200'
    return undefined
  }

  if (campo === 'gorduraPct') {
    if (form.gorduraPct.trim() === '') return undefined
    const n = paraNumero(form.gorduraPct)
    if (n === null || n < 1 || n > 70) return 'Informe a gordura corporal entre 1 e 70 %'
    return undefined
  }

  return undefined
}

const CAMPOS_OBRIGATORIOS: CamposObrigatorios[] = ['sexo', 'idade', 'pesoKg', 'alturaCm']

export function StepDados() {
  const { estado, dispatch } = useAvaliacao()
  const [form, setForm] = useState<FormularioDados>(() => paraFormulario(estado.dados))
  const [erros, setErros] = useState<Erros>({})

  function atualizar<K extends keyof FormularioDados>(campo: K, valor: FormularioDados[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function aoSairDoCampo(campo: keyof FormularioDados) {
    setForm((f) => {
      const erro = validarCampo(campo, f)
      setErros((e) => ({ ...e, [campo]: erro }))
      return f
    })
  }

  function aoSubmeter(e: FormEvent) {
    e.preventDefault()

    const camposParaValidar: (keyof FormularioDados)[] = [
      ...CAMPOS_OBRIGATORIOS,
      'cinturaCm',
      'quadrilCm',
      'gorduraPct',
    ]
    const novosErros: Erros = {}
    for (const campo of camposParaValidar) {
      const erro = validarCampo(campo, form)
      if (erro) novosErros[campo] = erro
    }
    setErros(novosErros)
    if (Object.keys(novosErros).length > 0) return

    const cintura = paraNumero(form.cinturaCm)
    const quadril = paraNumero(form.quadrilCm)
    const gorduraPct = paraNumero(form.gorduraPct)

    const dados: DadosPessoa = {
      sexo: form.sexo as Sexo,
      idade: Math.round(paraNumero(form.idade)!),
      pesoKg: paraNumero(form.pesoKg)!,
      alturaCm: paraNumero(form.alturaCm)!,
      atividade: form.atividade,
      ...(cintura !== null ? { cinturaCm: cintura } : {}),
      ...(quadril !== null ? { quadrilCm: quadril } : {}),
      ...(gorduraPct !== null ? { gorduraPct } : {}),
    }

    dispatch({ type: 'definirDados', dados })
  }

  return (
    <form onSubmit={aoSubmeter} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Sobre você</h1>
        <p className="mt-1 text-sm text-ink-2">
          Esses dados calculam seu gasto energético e classificações de saúde.
        </p>
      </div>

      <Card>
        <CardTitle>Sobre você</CardTitle>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-2">
              Sexo <span className="text-danger">*</span>
            </span>
            <SegmentedControl<Sexo>
              ariaLabel="Sexo"
              full
              value={form.sexo as Sexo}
              onChange={(v) => {
                atualizar('sexo', v)
                setErros((e) => ({ ...e, sexo: undefined }))
              }}
              options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'feminino', label: 'Feminino' },
              ]}
            />
            {erros.sexo ? <p className="mt-1 text-xs text-danger">{erros.sexo}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              label="Idade"
              unit="anos"
              inputMode="numeric"
              required
              value={form.idade}
              onChange={(v) => atualizar('idade', v)}
              onBlur={() => aoSairDoCampo('idade')}
              error={erros.idade}
              autoFocus
            />
            <NumberField
              label="Peso"
              unit="kg"
              inputMode="decimal"
              required
              value={form.pesoKg}
              onChange={(v) => atualizar('pesoKg', v)}
              onBlur={() => aoSairDoCampo('pesoKg')}
              error={erros.pesoKg}
            />
            <NumberField
              label="Altura"
              unit="cm"
              inputMode="decimal"
              required
              value={form.alturaCm}
              onChange={(v) => atualizar('alturaCm', v)}
              onBlur={() => aoSairDoCampo('alturaCm')}
              error={erros.alturaCm}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Atividade física</CardTitle>
        <div role="radiogroup" aria-label="Nível de atividade física" className="mt-4 flex flex-col gap-2">
          {NIVEIS_ATIVIDADE.map((nivel) => {
            const selecionado = form.atividade === nivel.id
            return (
              <button
                key={nivel.id}
                type="button"
                role="radio"
                aria-checked={selecionado}
                onClick={() => atualizar('atividade', nivel.id)}
                className={[
                  'flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                  selecionado ? 'border-brand bg-brand-soft' : 'border-border hover:border-border-strong',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      selecionado ? 'border-brand bg-brand text-white' : 'border-border-strong',
                    ].join(' ')}
                  >
                    {selecionado ? <Check size={12} /> : null}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{nivel.rotulo}</p>
                    <p className="text-sm text-ink-2">{nivel.descricao}</p>
                  </div>
                </div>
                <span className="num shrink-0 text-sm text-ink-3">{formatarNumero(nivel.fator, 3)}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardTitle>Medidas (opcional)</CardTitle>
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              label="Cintura"
              unit="cm"
              inputMode="decimal"
              value={form.cinturaCm}
              onChange={(v) => atualizar('cinturaCm', v)}
              onBlur={() => aoSairDoCampo('cinturaCm')}
              error={erros.cinturaCm}
            />
            <NumberField
              label="Quadril"
              unit="cm"
              inputMode="decimal"
              value={form.quadrilCm}
              onChange={(v) => atualizar('quadrilCm', v)}
              onBlur={() => aoSairDoCampo('quadrilCm')}
              error={erros.quadrilCm}
            />
            <NumberField
              label="Gordura corporal"
              unit="%"
              inputMode="decimal"
              value={form.gorduraPct}
              onChange={(v) => atualizar('gorduraPct', v)}
              onBlur={() => aoSairDoCampo('gorduraPct')}
              error={erros.gorduraPct}
              hint="Se tiver bioimpedância ou adipômetro. Sem esse dado, estimamos pela idade e IMC."
            />
          </div>
          <Callout tone="info">Sem cintura e quadril, o risco cardiovascular não é calculado.</Callout>
        </div>
      </Card>

      <Button type="submit" size="lg" full className="sm:w-auto sm:self-end" iconRight={<ArrowRight size={18} />}>
        Calcular resultados
      </Button>
    </form>
  )
}
