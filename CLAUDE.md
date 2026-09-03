# CLAUDE.md — Balanço Nutricional (feira)

Ferramenta educativa para feira pública de Nutrição: calcula VET, classifica IMC e risco cardiovascular, monta um dia alimentar por fotos, compara com o VET e projeta peso. Gera relatório para impressão/PDF.

## Stack (sobrescreve o global)

- **Frontend-only**: React 19 + Vite 8 + Tailwind v4 (CSS-first, tokens em `src/index.css` via `@theme`) + TypeScript. Sem backend, sem banco: nada é persistido além de `sessionStorage`.
- Ícones: `lucide-react`. Animação: `framer-motion`. Testes: `vitest` (só domínio, `src/**/*.test.ts`). Lint: `oxlint`.
- Deploy: `Dockerfile` (node build → nginx estático) para Easypanel. `npm run verificar` = typecheck + lint + test + build.

## Arquitetura

- `src/domain/` — funções puras de cálculo (fonte da verdade das regras). Nunca coloque regra nutricional em componente.
- `src/data/` — dados mocados editáveis: refeições (`refeicoes.ts`), níveis de atividade, equações.
- `src/state/avaliacao.tsx` — estado global da avaliação (Context + reducer + sessionStorage).
- `src/components/` — `ui/` primitivos, `steps/` passos do wizard, `meals/`, `charts/`, `report/`.

## Regras de domínio

- **TMB**: Mifflin-St Jeor (default), Harris-Benedict revisada 1984 (Roza & Shizgal), FAO/OMS 2004 (por faixa etária, só peso). VET = TMB × fator (1,2 / 1,375 / 1,55 / 1,725 / 1,9).
- **IMC**: adulto 18–59 pela OMS; **idoso ≥ 60 por Lipschitz (1994)**: < 22 baixo peso, 22–27 eutrofia, > 27 sobrepeso. Menor de 18: calcula, não classifica.
- **Risco CV**: cintura (OMS) mulher ≥ 80 / ≥ 88 cm, homem ≥ 94 / ≥ 102 cm; RCQ (OMS) mulher > 0,85, homem > 0,90.
- **Balanço**: normocalórico quando |ingerido − VET| ≤ 5 % do VET.
- **Projeção linear (referência)**: 7700 kcal = 1 kg; aparece tracejada como "regra simples".
- **Projeção dinâmica (principal)**: modelo de Hall et al. (Lancet 2011), replicado do JavaScript público do NIDDK Body Weight Planner em `src/domain/hall.ts` (RK4 diário; gordura/massa magra com partição de Forbes; gasto = K + 22·L + 3,2·F + δ·peso + termogênese adaptativa + 10 % TEF; glicogênio com 3,7 kg de água por kg; fluido extracelular por sódio proporcional à ingestão). Baseline: VET = ingestão de manutenção, TMB da equação escolhida como RMR, δ = (0,9·VET − TMB)/peso. Gordura inicial: informada (1–70 %) ou Jackson 2002 (clamp 0–60 %). Os testes em `hall.test.ts` comparam com valores gerados pelo JS original (±0,01 kg): não altere constantes sem regenerar os valores-ouro (`scratchpad/bwp-golden.mjs`).
- **Meta**: peso-alvo + prazo → ingestão diária por bissecção (passo 200 kcal, tolerância 1 g) e ingestão de manutenção no alvo; avisar abaixo de 1000 kcal/dia e quando inalcançável.

## Convenções

- Idioma da UI e do código (nomes de domínio): português.
- Light-first; sem dark mode nesta versão. Acento único verde (`--color-brand`); cores de estado só em resultado.
- Copy voltada à pessoa atendida na feira, sem jargão de implementação.
