# Roadmap

## Phase 1 — Planejamento e arquitetura

- [x] Definir objetivo, escopo e critérios de sucesso
- [x] Definir arquitetura e estrutura de pastas
- [x] Definir modelo de dados e regras de estoque
- [x] Definir contratos principais da API
- [x] Definir estratégia de testes e implantação

## Phase 2 — Fundação e banco de dados

- [x] Configurar Node.js, Express e testes
- [x] Criar servidor e endpoint de saúde
- [x] Configurar PostgreSQL, Drizzle e migrations
- [x] Criar tabelas, enums, índices e constraints
- [ ] Criar seed de categorias e dados demonstrativos

## Phase 3 — Catálogo e estoque

- [ ] Gerenciar categorias
- [ ] Gerenciar fornecedores
- [ ] Implementar CRUD e arquivamento de produtos
- [ ] Implementar busca, filtros e paginação
- [ ] Implementar entrada de estoque
- [ ] Implementar saída de estoque
- [ ] Implementar ajuste de estoque
- [ ] Implementar histórico de movimentações
- [ ] Validar concorrência e impedir estoque negativo

## Phase 4 — Assistência técnica

- [ ] Gerenciar clientes
- [ ] Gerenciar ordens de serviço
- [ ] Implementar filtros e status de reparo
- [ ] Vincular peças aos reparos
- [ ] Descontar e devolver estoque de peças

## Phase 5 — Dashboard e frontend

- [ ] Implementar indicadores do dashboard
- [ ] Criar shell responsivo e componentes compartilhados
- [ ] Criar interface de produtos e estoque
- [ ] Criar interface de clientes
- [ ] Criar interface de reparos
- [ ] Validar acessibilidade e responsividade

## Phase 6 — Qualidade e documentação

- [x] Criar testes da fundação e migrations
- [ ] Concluir testes unitários e de integração da API
- [ ] Concluir testes E2E da interface
- [ ] Validar persistência e fluxo completo
- [ ] Finalizar `api.md`, `Contexto.md` e `README.md`
- [ ] Executar auditoria e revisão final

## Phase 7 — Publicação

- [ ] Criar repositório público `trabiagustavo` no GitHub
- [ ] Configurar banco Neon
- [ ] Implantar na Vercel
- [ ] Executar smoke tests em produção
- [ ] Registrar relatório final e URLs
