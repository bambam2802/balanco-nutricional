# Balanço Nutricional — ferramenta para feira

Calcula VET, classifica IMC (adulto e idoso) e risco cardiovascular, monta um dia alimentar por fotos, compara com o VET e projeta o peso. Gera relatório para impressão ou PDF. Tudo roda no navegador, sem cadastro nem servidor.

A projeção de peso usa o modelo dinâmico de Hall et al. (Lancet, 2011), o mesmo do Body Weight Planner do NIDDK, ao lado da regra simples de 7.700 kcal por kg, para mostrar por que a mudança de peso desacelera. O passo 4 também tem um modo meta: peso-alvo e prazo viram a ingestão diária necessária.

## Abrir sem instalar nada (jeito mais simples para a feira)

Rode uma vez `npm run build` (ou use o arquivo já gerado). Ele cria **um único arquivo** `dist/index.html`, com tudo dentro. Basta copiar esse arquivo para qualquer notebook ou pendrive e abrir com dois cliques no Chrome ou Edge. Não precisa de servidor nem de internet, exceto para carregar as fotos dos pratos (sem internet aparece um ícone no lugar da foto).

Atenção: o `index.html` da raiz do projeto **não** abre direto: ele é só o molde usado pelo Vite. Use o de `dist/`.

## Rodar em modo de desenvolvimento

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
