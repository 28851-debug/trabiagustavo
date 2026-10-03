# Trabiagustavo

Sistema web responsivo para uma loja de eletrônicos e assistência técnica. Reúne catálogo, estoque auditável, clientes, ordens de serviço, consumo/devolução de peças e dashboard operacional.

## Funcionalidades

- Produtos com categorias, fornecedores, busca, filtros e arquivamento lógico.
- Entradas, saídas e ajustes de estoque com histórico e proteção contra saldo negativo.
- Clientes e ordens de serviço com oito status, diagnóstico, valores e técnico.
- Peças vinculadas à OS com baixa e devolução transacionais.
- Dashboard com saldos, valores, alertas, reparos ativos e movimentos recentes.
- Interface em português do Brasil, responsiva e sem dependência de framework no navegador.

## Tecnologias

Node.js 20+, Express, PostgreSQL/Neon, Drizzle ORM, HTML/CSS/JavaScript, Vitest, Supertest e Playwright.

## Executar localmente

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env` e informe uma URL PostgreSQL válida em `DATABASE_URL`.

3. Prepare o banco e os dados básicos:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   Para incluir um produto e cliente demonstrativos, execute o seed com `SEED_DEMO_DATA=true`.

4. Gere os arquivos públicos e inicie:

   ```bash
   npm run build
   npm start
   ```

   O endereço padrão é `http://localhost:3000`. Durante o desenvolvimento, use `npm run dev` após o build.

## Testes e qualidade

```bash
npm test
npm run test:e2e
npm audit --omit=dev
```

Os testes de API usam PostgreSQL real em memória via PGlite. O Playwright inicia sua própria aplicação de teste na porta 4173.

## Estrutura

- `backend/src/`: API, regras de negócio, repositórios, schema e migrations.
- `frontend/`: fontes da interface.
- `public/`: saída gerada e ignorada pelo Git.
- `tests/integration/`: API, concorrência, migrations e persistência.
- `tests/e2e/`: fluxos no navegador.
- `api.md`: contratos e exemplos da API.

## Implantação na Vercel

1. Crie um PostgreSQL Neon e defina `DATABASE_URL` no projeto Vercel.
2. Execute `npm run db:migrate` e `npm run db:seed` apontando para esse banco.
3. Importe o repositório na Vercel ou execute `npx vercel --prod`.
4. Verifique `/api/health`, o dashboard e um fluxo de estoque após a publicação.

Não há autenticação nesta primeira versão. Use o sistema em ambiente controlado até adicionar controle de acesso.
