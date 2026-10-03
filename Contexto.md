# Contexto do Projeto

## Objetivo

O Trabiagustavo é um sistema web para controlar produtos, estoque, clientes e ordens de serviço de uma loja brasileira de eletrônicos e assistência técnica. O backend será a única fonte de verdade para saldos e movimentações.

## Tecnologias

- Node.js 20+ com módulos ES e Express 5.2.1.
- PostgreSQL em produção (Neon) e PGlite em testes.
- Drizzle ORM 0.45.3 e Drizzle Kit 0.31.11 para schema e migrations.
- Zod 4.6.5 para validação das futuras entradas da API.
- HTML, CSS e JavaScript modular sem framework no frontend.
- Vitest, Supertest e Playwright para testes.
- Vercel para hospedagem.

## Arquitetura atual

O ponto de entrada `server.js` cria a conexão PostgreSQL e exporta o aplicativo Express. `backend/src/app.js` é uma factory injetável usada pelos testes. O backend será dividido em rotas, controladores, serviços transacionais e repositórios. O código-fonte da interface ficará em `frontend/` e será copiado para `public/` durante o build.

## Banco de dados

A migration inicial cria `categories`, `suppliers`, `products`, `inventory_movements`, `customers`, `repair_orders` e `repair_parts`. Enums restringem tipos de movimentação e status de reparo. Chaves estrangeiras, índices, unicidade normalizada e constraints impedem valores negativos e campos críticos vazios.

Dinheiro é armazenado em centavos inteiros. Timestamps usam UTC. Produtos possuem arquivamento lógico por `archived_at`.

## Funcionalidades existentes

- Factory Express com JSON limitado, cabeçalhos de segurança e erro JSON centralizado.
- `GET /api/health`.
- Conexão PostgreSQL configurável por `DATABASE_URL`.
- Schema Drizzle e migration inicial executável em PostgreSQL/PGlite.
- Testes reais de saúde, criação das tabelas, enums e constraint de estoque.
- CRUD completo de categorias e fornecedores, com normalização de nomes, validação e proteção contra exclusão de registros em uso.
- Catálogo de produtos com SKU único normalizado, saldo inicial auditado, valores em centavos, busca, filtros, paginação, detalhes calculados e arquivamento lógico.
- Entrada, saída e ajuste usam transação e bloqueio `FOR UPDATE`; histórico global e por produto é paginado e testes concorrentes comprovam a prevenção de saldo negativo.
- Clientes e ordens de serviço possuem CRUD, validação, filtros, oito status e conclusão automática ao marcar `DELIVERED`.
- Peças de reparo são consumidas/devolvidas em transações, com custo capturado, referência da OS e proteção concorrente.
- Dashboard agrega produtos, unidades, valores, alertas, reparos ativos e movimentos; seed idempotente cria 16 categorias e dados opcionais.
- Frontend possui shell administrativo responsivo, navegação móvel, formatadores `pt-BR`, cliente HTTP, feedback visual e dashboard conectado à API.
- A tela de produtos reúne busca, filtros, cadastro, edição, arquivamento, criação rápida de categorias/fornecedores, entradas, saídas, ajustes e histórico de estoque.
- As telas de clientes e ordens de serviço oferecem cadastro, busca, edição, status textuais, detalhes técnicos e consumo/devolução de peças com atualização transacional do estoque.

## Regras de negócio definidas

- Estoque nunca pode ser negativo.
- Saldo e histórico devem mudar na mesma transação.
- Quantidade não será alterada pelo endpoint comum de edição de produto.
- Uso de peça em reparo cria `REPAIR_USAGE`; remoção confirmada cria `RETURN`.
- Produtos são arquivados para preservar auditoria.

## Estado atual e próximo passo

Todas as áreas funcionais estão implementadas. O próximo passo é empacotar, documentar, executar o fluxo completo e preparar a implantação.

## Problemas e decisões

- SQLite foi descartado em produção porque o filesystem da Vercel é efêmero; Neon/PostgreSQL será usado.
- O caminho de migrations nos testes usa `fileURLToPath` para funcionar corretamente no Windows.
- A primeira versão não terá autenticação; a implantação deve ser tratada como uso controlado até essa proteção ser adicionada.
