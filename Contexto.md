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

## Regras de negócio definidas

- Estoque nunca pode ser negativo.
- Saldo e histórico devem mudar na mesma transação.
- Quantidade não será alterada pelo endpoint comum de edição de produto.
- Uso de peça em reparo cria `REPAIR_USAGE`; remoção confirmada cria `RETURN`.
- Produtos são arquivados para preservar auditoria.

## Estado atual e próximo passo

A fundação e o banco estão implementados. A próxima tarefa é criar os módulos completos de categorias e fornecedores, incluindo validação, restrições de exclusão, testes e documentação da API.

## Problemas e decisões

- SQLite foi descartado em produção porque o filesystem da Vercel é efêmero; Neon/PostgreSQL será usado.
- O caminho de migrations nos testes usa `fileURLToPath` para funcionar corretamente no Windows.
- A primeira versão não terá autenticação; a implantação deve ser tratada como uso controlado até essa proteção ser adicionada.
