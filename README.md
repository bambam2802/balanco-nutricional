# Balanço Nutricional — ferramenta para feira

Calcula VET, classifica IMC (adulto e idoso) e risco cardiovascular, monta um dia alimentar por fotos, compara com o VET e projeta o peso. Gera relatório para impressão ou PDF. Tudo roda no navegador, sem cadastro nem servidor.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`). No celular ou tablet na mesma rede Wi-Fi, use `npm run dev -- --host` e abra o endereço de rede que aparecer.

## Editar as refeições e as calorias

Tudo está em `src/data/refeicoes.ts`: 6 refeições, 4 opções cada, com nome, descrição da porção, kcal, nível (1 = mais leve, 4 = mais calórica) e a URL da foto. Basta trocar os números ou textos e salvar; a página atualiza sozinha.

- Fatores de atividade: `src/data/atividade.ts`.
- Fórmulas e pontos de corte (OMS, Lipschitz, FAO/OMS): `src/domain/`, com testes em `npm run test`.
- Tolerância do "equilíbrio calórico" (5 % do VET): `TOLERANCIA_NORMO` em `src/domain/balanco.ts`.

## Relatório em PDF

No último passo, "Imprimir / salvar PDF" abre a caixa de impressão do navegador. Escolha "Salvar como PDF" para enviar pelo celular ou imprima direto.

## Publicar

`npm run build` gera a pasta `dist/` (site estático). O `Dockerfile` serve essa pasta com nginx e roda o gate de qualidade (`npm run verificar`) dentro do build.
