# Balanço Nutricional — ferramenta para feira

Calcula VET, classifica IMC (adulto e idoso) e risco cardiovascular, monta um dia alimentar por fotos, compara com o VET e projeta o peso. Gera relatório para impressão ou PDF. Tudo roda no navegador, sem cadastro nem servidor.

A projeção de peso usa o modelo dinâmico de Hall et al. (Lancet, 2011), o mesmo do Body Weight Planner do NIDDK, ao lado da regra simples de 7.700 kcal por kg, para mostrar por que a mudança de peso desacelera. O passo 4 também tem um modo meta: peso-alvo e prazo viram a ingestão diária necessária.

## Site publicado

O app está no ar em **https://bambam2802.github.io/balanco-nutricional/** e abre em qualquer computador ou celular. Para atualizar o site depois de mudar alimentos ou código:

```bash
npm run publicar
```

Isso gera o build e envia para a branch `gh-pages`; o site atualiza em 1 a 2 minutos. Código-fonte: https://github.com/bambam2802/balanco-nutricional

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

## O que foi feito e onde paramos (3 de setembro de 2026)

### Entregue e testado
- **Passo 1 — Dados**: sexo, idade, peso, altura, nível de atividade (5 níveis), cintura, quadril e % de gordura corporal (opcionais).
- **Passo 2 — Resultados**: VET com escolha ao vivo entre Mifflin-St Jeor, Harris-Benedict (1984) e FAO/OMS (2004); IMC com régua e legenda de faixas (OMS para adultos, Lipschitz para 60 anos ou mais; menor de 18 não é classificado); circunferência da cintura e relação cintura/quadril pela OMS.
- **Passo 3 — Refeições**: 6 refeições com 4 opções cada, em fotos, da mais leve à mais calórica, mais "Não faço esta refeição"; barra fixa somando as calorias contra o VET.
- **Passo 4 — Balanço**: déficit, equilíbrio (±5 % do VET) ou superávit; gráfico de projeção de peso com duas curvas (modelo dinâmico de Hall et al. 2011, o mesmo do Body Weight Planner do NIDDK, e a regra simples de 7.700 kcal por kg) em 4, 12, 24 semanas ou 1 ano; modo meta (peso-alvo e prazo viram a ingestão diária necessária e a de manutenção, com avisos abaixo de 1.000 kcal e para meta inalcançável).
- **Relatório**: vista A4 com todos os dados, o dia alimentar, o balanço, as duas curvas e a meta; botão "Imprimir / salvar PDF".
- **Publicação**: arquivo único `dist/index.html` que abre do disco, e site no GitHub Pages.

### Como o modelo de Hall foi validado
O JavaScript público do planner do NIDDK foi executado em Node para gerar valores de referência de três perfis; os testes em `src/domain/hall.test.ts` exigem coincidência de 0,01 kg. Não altere as constantes de `src/domain/hall.ts` sem regenerar esses valores.

### Verificação automática
`npm run verificar` roda typecheck, lint, 93 testes de domínio e o build. Os fluxos foram validados em desktop e celular (390 px) e no PDF por um harness com o Chrome instalado.

### Onde paramos e próximos passos possíveis
- Revisar as calorias e porções das 24 opções em `src/data/refeicoes.ts` com o material da disciplina (hoje são estimativas plausíveis com base TACO).
- Fotos vêm do Unsplash: sem internet aparece um ícone. Para funcionar 100 % offline, colocar as fotos em `public/fotos/` e apontar o campo `foto` para elas.
- A estimativa de gordura corporal (Jackson 2002) é para adultos; menores de 18 recebem um aviso.
- O modo meta usa dieta fixa (50 % carboidrato, sódio proporcional), como o padrão do planner; mudanças de atividade física ao longo do tempo não foram implementadas.
- Pequenas melhorias de organização: unificar os mapas de cor e texto repetidos entre Resultados, Balanço e Relatório.
