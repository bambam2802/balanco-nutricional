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
- **Projeção**: 7700 kcal = 1 kg, linear; avisar quando |ritmo| > 1 kg/semana.

## Convenções

- Idioma da UI e do código (nomes de domínio): português.
- Light-first; sem dark mode nesta versão. Acento único verde (`--color-brand`); cores de estado só em resultado.
- Copy voltada à pessoa atendida na feira, sem jargão de implementação.
