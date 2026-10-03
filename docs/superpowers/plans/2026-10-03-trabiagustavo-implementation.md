# Trabiagustavo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir, testar, documentar, publicar no GitHub e implantar na Vercel o sistema completo de estoque e assistência técnica Trabiagustavo.

**Architecture:** Uma aplicação Express exportada por `server.js` fornece a API REST e usa serviços transacionais sobre Drizzle/PostgreSQL; em produção o banco será Neon e nos testes PGlite executará o mesmo schema. O frontend multipágina permanece em `frontend/`, usa módulos JavaScript sem framework e é copiado para `public/` no build da Vercel.

**Tech Stack:** Node.js 20+, Express, PostgreSQL/Neon, Drizzle ORM, Zod, HTML/CSS/JavaScript, Vitest, Supertest, PGlite, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-03-trabiagustavo-design.md`

## Global Constraints

- Usar Node.js 20 ou superior e módulos ES.
- Manter todo código-fonte da interface em `frontend/`, com HTML, CSS e JavaScript separados.
- Não adicionar framework frontend; usar JavaScript modular e APIs nativas do navegador.
- Armazenar dinheiro em centavos inteiros e estoque em inteiros não negativos.
- Executar cálculos críticos de estoque somente no backend e dentro de transações.
- Usar PostgreSQL/Neon em produção; não usar LocalStorage ou SQLite como banco principal.
- Persistir timestamps em UTC e exibir datas em `America/Sao_Paulo`.
- Manter `Roadmap.md`, `Contexto.md` e `api.md` sincronizados em cada tarefa.
- Não armazenar segredos; documentar `DATABASE_URL` em `.env.example`.
- O repositório final será público, chamado `trabiagustavo`, com branch `main` e deploy na Vercel.

## Review Focus

- Duas saídas ou consumos simultâneos sobre o mesmo saldo devem serializar e jamais produzir estoque negativo; Task 4 inclui o teste concorrente.
- SKU e nomes únicos com diferenças apenas de espaços ou caixa devem ser tratados de forma consistente; Tasks 2 e 3 incluem testes de normalização e conflito.
- Dinheiro fracionário, negativo ou acima do intervalo seguro deve ser rejeitado sem arredondamento silencioso; Task 3 inclui testes de limites.
- Remover duas vezes a mesma peça de reparo deve devolver o estoque uma única vez; Task 6 inclui teste de idempotência por conflito/not-found.
- Datas inválidas, intervalos invertidos e filtros com caracteres `%`/`_` não devem quebrar ou ampliar consultas inesperadamente; Tasks 3 e 5 incluem testes específicos.

---

### Task 1: Fundação, banco e documentação viva

**Files:**
- Create: `package.json`, `.gitignore`, `.env.example`, `drizzle.config.js`, `server.js`
- Create: `backend/src/app.js`, `backend/src/config.js`, `backend/src/database/schema.js`, `backend/src/database/client.js`, `backend/src/database/migrate.js`
- Create: `backend/src/middleware/error-handler.js`, `backend/src/routes/health-routes.js`
- Create: `tests/helpers/test-database.js`, `tests/helpers/test-app.js`, `tests/integration/health.test.js`, `tests/integration/migrations.test.js`
- Create: `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Produces: `createApp({ db, logger, staticDir }) -> Express`, `createProductionDb() -> DrizzleDatabase`, `createTestDb() -> { db, client, reset, close }`, `runMigrations(db) -> Promise<void>`.
- Produces schema exports: `categories`, `suppliers`, `products`, `inventoryMovements`, `customers`, `repairOrders`, `repairParts` and database enums.

- [ ] **Step 1: Configure the test runner and dependencies**

Create the package scripts `dev`, `build`, `start`, `test`, `test:watch`, `test:e2e`, `db:generate`, `db:migrate` and `db:seed`; install only the stack named in the header plus `helmet`, `cors`, `postgres`, `@electric-sql/pglite` and development tooling.

- [ ] **Step 2: Write failing foundation tests**

`health.test.js` asserts `GET /api/health` returns `200` and `{ status: "ok" }`. `migrations.test.js` creates a fresh PGlite database, runs migrations, and asserts all seven tables and required enums/constraints exist.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test -- tests/integration/health.test.js tests/integration/migrations.test.js`
Expected: FAIL because the app factory, schema and migrations do not exist.

- [ ] **Step 4: Implement the minimal foundation**

Define the complete Drizzle schema from the spec, database factories, app factory, health route, centralized JSON error shape and root `server.js`. Add the initial generated SQL migration. Create the official roadmap with all phases pending, concise current-state context, and an API skeleton documenting health.

- [ ] **Step 5: Run foundation verification**

Run: `npm test -- tests/integration/health.test.js tests/integration/migrations.test.js`
Expected: PASS with 0 failed tests.

- [ ] **Step 6: Update documentation and commit**

Mark planning, structure and schema complete in `Roadmap.md`; record the actual dependency versions and schema in `Contexto.md`.

```bash
git add package.json package-lock.json .gitignore .env.example drizzle.config.js server.js backend tests Roadmap.md Contexto.md api.md
git commit -m "chore: initialize inventory platform"
```

### Task 2: Categorias e fornecedores

**Files:**
- Create: `backend/src/errors/app-error.js`, `backend/src/utils/normalize.js`
- Create: `backend/src/schemas/category-schema.js`, `backend/src/schemas/supplier-schema.js`
- Create: `backend/src/repositories/category-repository.js`, `backend/src/repositories/supplier-repository.js`
- Create: `backend/src/services/category-service.js`, `backend/src/services/supplier-service.js`
- Create: `backend/src/controllers/category-controller.js`, `backend/src/controllers/supplier-controller.js`
- Create: `backend/src/routes/category-routes.js`, `backend/src/routes/supplier-routes.js`
- Test: `tests/integration/categories.test.js`, `tests/integration/suppliers.test.js`
- Modify: `backend/src/app.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Consumes: `createApp`, Drizzle `db`, `categories`, `suppliers`, centralized error middleware.
- Produces: CRUD at `/api/categories` and `/api/suppliers`; `normalizeUniqueName(value) -> string`; error codes `VALIDATION_ERROR`, `DUPLICATE_CATEGORY`, `DUPLICATE_SUPPLIER`, `RESOURCE_IN_USE`, `NOT_FOUND`.

- [ ] **Step 1: Write failing category and supplier API tests**

Cover create/list/update/delete, required names, normalized duplicate names (`" Capas "` vs `"capas"`), invalid contact email, missing IDs, and `409 RESOURCE_IN_USE` when referenced.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/integration/categories.test.js tests/integration/suppliers.test.js`
Expected: FAIL with routes returning 404.

- [ ] **Step 3: Implement schemas, repositories, services and routes**

Use Zod at the HTTP boundary, case-insensitive uniqueness in the database, and service-level translation of constraint violations to stable error codes.

- [ ] **Step 4: Run feature and full tests**

Run: `npm test -- tests/integration/categories.test.js tests/integration/suppliers.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Synchronize documentation and commit**

Document every category and supplier endpoint including request, response, validation and errors.

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: manage categories and suppliers"
```

### Task 3: Catálogo de produtos, busca e arquivamento

**Files:**
- Create: `backend/src/utils/money.js`, `backend/src/schemas/product-schema.js`
- Create: `backend/src/repositories/product-repository.js`, `backend/src/services/product-service.js`
- Create: `backend/src/controllers/product-controller.js`, `backend/src/routes/product-routes.js`
- Test: `tests/unit/money.test.js`, `tests/integration/products.test.js`
- Modify: `backend/src/app.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Consumes: category/supplier repositories, `products`, `inventoryMovements` and app errors.
- Produces: `parseMoneyCents(value) -> number`, product CRUD, `GET /api/products` query contract `{ page, pageSize, search, categoryId, brand, compatibility, stockStatus, minPriceCents, maxPriceCents }`, and `GET /api/products/:id`.
- Product writes use `sku`, `name`, `category_id`, `brand`, `compatibility`, `cost_price_cents`, `sale_price_cents`, `quantity`, `minimum_stock`, `supplier_id`, `notes`.

- [ ] **Step 1: Write failing money and product tests**

Assert safe integer cents, rejection of negative/fractional/unsafe values, valid product creation, required name/SKU/category, duplicate normalized SKU, negative stock, missing category, edit without direct quantity mutation, detail totals, and archive semantics.

- [ ] **Step 2: Add failing search/filter/pagination tests**

Assert searches by name, SKU, brand, compatibility and category; filters for stock status and price; literal `%`/`_` input does not act as a wildcard; pagination metadata is stable and archived products are excluded by default.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test -- tests/unit/money.test.js tests/integration/products.test.js`
Expected: FAIL because product modules and routes do not exist.

- [ ] **Step 4: Implement product behavior**

Create a product and its initial `IN` movement in one transaction. Disallow quantity changes through `PUT`; compute inventory cost and retail totals from integer cents; archive on `DELETE`.

- [ ] **Step 5: Run feature and full tests**

Run: `npm test -- tests/unit/money.test.js tests/integration/products.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 6: Synchronize documentation and commit**

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: add searchable product catalog"
```

### Task 4: Movimentações transacionais de estoque

**Files:**
- Create: `backend/src/schemas/stock-schema.js`
- Create: `backend/src/repositories/inventory-repository.js`, `backend/src/services/inventory-service.js`
- Create: `backend/src/controllers/inventory-controller.js`, `backend/src/routes/inventory-routes.js`
- Test: `tests/integration/inventory.test.js`, `tests/integration/inventory-concurrency.test.js`
- Modify: `backend/src/routes/product-routes.js`, `backend/src/app.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Consumes: product repository and product row locking inside Drizzle transactions.
- Produces: `addStock(productId, quantity, note)`, `removeStock(productId, quantity, note)`, `adjustStock(productId, newStock, reason)` and paginated movement queries.
- Produces routes: `POST /api/products/:id/stock/add`, `/remove`, `/adjust`, `GET /api/products/:id/movements`, `GET /api/inventory/movements`.

- [ ] **Step 1: Write failing stock operation tests**

Pin the examples 200+20=220, then +30=250, 250-50=200; insufficient 5-10 remains 5; zero, negative and fractional quantities are rejected; adjustment 20→17 records quantity 3, previous 20 and new 17; archived products reject changes.

- [ ] **Step 2: Write the failing concurrency test**

Create stock 1, issue two simultaneous removals of 1, assert exactly one succeeds, one returns `409 INSUFFICIENT_STOCK`, final stock is 0 and exactly one `OUT` movement exists.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test -- tests/integration/inventory.test.js tests/integration/inventory-concurrency.test.js`
Expected: FAIL because stock services and routes do not exist.

- [ ] **Step 4: Implement transactional operations and history**

Lock the product row with `FOR UPDATE`, validate inside the transaction, update the balance and insert the movement before commit. Adjustment requires a non-empty reason and rejects no-op changes.

- [ ] **Step 5: Run feature and full tests**

Run: `npm test -- tests/integration/inventory.test.js tests/integration/inventory-concurrency.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 6: Synchronize documentation and commit**

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: add transactional stock movements"
```

### Task 5: Clientes e ordens de serviço

**Files:**
- Create: `backend/src/schemas/customer-schema.js`, `backend/src/schemas/repair-schema.js`
- Create: `backend/src/repositories/customer-repository.js`, `backend/src/repositories/repair-repository.js`
- Create: `backend/src/services/customer-service.js`, `backend/src/services/repair-service.js`
- Create: `backend/src/controllers/customer-controller.js`, `backend/src/controllers/repair-controller.js`
- Create: `backend/src/routes/customer-routes.js`, `backend/src/routes/repair-routes.js`
- Test: `tests/integration/customers.test.js`, `tests/integration/repairs.test.js`
- Modify: `backend/src/app.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Produces: customer CRUD at `/api/customers`; repair CRUD at `/api/repairs`; statuses exactly as listed in the spec.
- Repair queries accept `{ page, pageSize, status, customer, device, technician, entryDateFrom, entryDateTo }`.

- [ ] **Step 1: Write failing customer tests**

Cover create/list/detail/update/delete, required name/phone, optional valid email, missing resource, and conflict when deleting a customer with repairs.

- [ ] **Step 2: Write failing repair tests**

Cover creation, required customer/device/problem, default `RECEIVED`, all valid statuses, invalid status, invalid price/cost, completion date behavior, detail, update, delete without parts, filters and rejection of invalid or inverted date ranges.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test -- tests/integration/customers.test.js tests/integration/repairs.test.js`
Expected: FAIL with 404 routes.

- [ ] **Step 4: Implement customers and repairs**

Keep technician as optional text, set `completed_at` when status first becomes `DELIVERED`, clear it when moving away before delivery finalization, and preserve UTC dates.

- [ ] **Step 5: Run feature and full tests**

Run: `npm test -- tests/integration/customers.test.js tests/integration/repairs.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 6: Synchronize documentation and commit**

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: manage customers and repairs"
```

### Task 6: Integração de peças com reparos

**Files:**
- Create: `backend/src/schemas/repair-part-schema.js`
- Create: `backend/src/repositories/repair-part-repository.js`, `backend/src/services/repair-part-service.js`
- Create: `backend/src/controllers/repair-part-controller.js`
- Test: `tests/integration/repair-parts.test.js`, `tests/integration/repair-parts-concurrency.test.js`
- Modify: `backend/src/routes/repair-routes.js`, `backend/src/repositories/repair-repository.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Consumes: inventory transaction primitives and repair/product repositories.
- Produces: `addRepairPart(repairId, productId, quantity)` and `removeRepairPart(repairId, partId)`; routes `POST /api/repairs/:id/parts` and `DELETE /api/repairs/:id/parts/:partId`.

- [ ] **Step 1: Write failing repair-part tests**

Assert stock 5→4 when one display is used; record `REPAIR_USAGE` with repair reference and captured unit cost; reject unavailable/archived product, insufficient stock, invalid repair and non-positive quantity.

- [ ] **Step 2: Write failing removal and concurrency tests**

Assert removal restores stock with `RETURN`; second removal returns not-found/conflict and does not restore twice; simultaneous repair usages against stock 1 allow exactly one success.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test -- tests/integration/repair-parts.test.js tests/integration/repair-parts-concurrency.test.js`
Expected: FAIL because repair-part behavior is missing.

- [ ] **Step 4: Implement atomic repair-part use and return**

Use one transaction and the same product row lock for the part row, product balance and inventory movement. Prevent deleting a repair that retains part rows.

- [ ] **Step 5: Run feature and full tests**

Run: `npm test -- tests/integration/repair-parts.test.js tests/integration/repair-parts-concurrency.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 6: Synchronize documentation and commit**

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: consume inventory in repair orders"
```

### Task 7: Dashboard e seed demonstrativo

**Files:**
- Create: `backend/src/repositories/dashboard-repository.js`, `backend/src/services/dashboard-service.js`
- Create: `backend/src/controllers/dashboard-controller.js`, `backend/src/routes/dashboard-routes.js`
- Create: `backend/src/database/seed.js`
- Test: `tests/integration/dashboard.test.js`, `tests/integration/seed.test.js`
- Modify: `backend/src/app.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Produces: `GET /api/dashboard` with `total_products`, `total_units`, `inventory_cost_cents`, `potential_retail_cents`, `low_stock_count`, `out_of_stock_count`, `active_repairs`, `recent_movements`, `highest_stock_products`.
- Produces idempotent seed command with core categories and realistic demonstration data only when `SEED_DEMO_DATA=true`.

- [ ] **Step 1: Write failing dashboard and seed tests**

Assert all totals from a fixed fixture, low stock as `quantity > 0 && quantity <= minimum_stock`, out-of-stock at 0, active repairs excluding delivered/cancelled, ordering/limits, and seed idempotence.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/integration/dashboard.test.js tests/integration/seed.test.js`
Expected: FAIL because dashboard and seed do not exist.

- [ ] **Step 3: Implement aggregate queries and seed**

Compute money totals in SQL using integer arithmetic. Seed the required category list and a small coherent demo set through existing services.

- [ ] **Step 4: Run feature and full tests**

Run: `npm test -- tests/integration/dashboard.test.js tests/integration/seed.test.js && npm test`
Expected: all tests PASS.

- [ ] **Step 5: Synchronize documentation and commit**

```bash
git add backend tests Roadmap.md Contexto.md api.md
git commit -m "feat: add operational dashboard"
```

### Task 8: Shell responsivo e dashboard frontend

**Files:**
- Create: `frontend/index.html`, `frontend/css/style.css`
- Create: `frontend/js/api.js`, `frontend/js/app.js`, `frontend/js/ui.js`, `frontend/js/formatters.js`, `frontend/js/dashboard.js`
- Create: `tests/unit/frontend-formatters.test.js`, `tests/e2e/dashboard.spec.js`
- Modify: `Roadmap.md`, `Contexto.md`

**Interfaces:**
- Consumes: `GET /api/dashboard` and shared API error format.
- Produces: `api.request(path, options)`, `formatCurrency(cents)`, `formatDate(iso)`, `showToast`, `setBusy`, `confirmAction` and the shared responsive navigation.

- [ ] **Step 1: Write failing formatter and dashboard E2E tests**

Assert `4990 -> "R$ 49,90"`, `129990 -> "R$ 1.299,90"`, Brasília date rendering, dashboard cards, low-stock panel, recent movement rendering, mobile navigation and visible API-error feedback.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/unit/frontend-formatters.test.js && npx playwright test tests/e2e/dashboard.spec.js`
Expected: FAIL because frontend files do not exist.

- [ ] **Step 3: Implement shared UI and dashboard**

Use semantic HTML, accessible labels/dialogs, CSS custom properties, keyboard-visible focus, loading skeletons and compact responsive layouts. Do not add a chart library; render simple bars and lists with HTML/CSS.

- [ ] **Step 4: Run frontend and full verification**

Run: `npm test -- tests/unit/frontend-formatters.test.js && npx playwright test tests/e2e/dashboard.spec.js && npm test`
Expected: all commands PASS.

- [ ] **Step 5: Update docs and commit**

```bash
git add frontend tests Roadmap.md Contexto.md
git commit -m "feat: build responsive dashboard"
```

### Task 9: Interface de produtos e estoque

**Files:**
- Create: `frontend/products.html`, `frontend/js/products.js`, `frontend/js/inventory.js`, `frontend/js/catalog-admin.js`
- Test: `tests/e2e/products.spec.js`, `tests/e2e/inventory.spec.js`
- Modify: `frontend/css/style.css`, `Roadmap.md`, `Contexto.md`

**Interfaces:**
- Consumes: product, category, supplier and inventory APIs plus shared UI helpers.
- Produces: searchable/filterable product table, product form/detail, category/supplier administration, stock add/remove/adjust dialogs and movement history.

- [ ] **Step 1: Write failing product UI tests**

Cover create/edit/archive, duplicate SKU error, search by `iPhone 13`, category/brand/compatibility/stock/price filters, pagination, details/totals and responsive product cards/table.

- [ ] **Step 2: Write failing inventory UI tests**

Cover previews 200+20=220 and 220-15=205, backend-confirmed result, insufficient-stock feedback, adjustment confirmation with reason, movement history and double-click prevention.

- [ ] **Step 3: Run tests to verify RED**

Run: `npx playwright test tests/e2e/products.spec.js tests/e2e/inventory.spec.js`
Expected: FAIL because product UI is missing.

- [ ] **Step 4: Implement product and inventory pages**

Keep previews advisory; send only quantities/new absolute stock to the backend and always replace UI state with the server response.

- [ ] **Step 5: Run E2E and full tests**

Run: `npx playwright test tests/e2e/products.spec.js tests/e2e/inventory.spec.js && npm test && npx playwright test`
Expected: all commands PASS.

- [ ] **Step 6: Update docs and commit**

```bash
git add frontend tests Roadmap.md Contexto.md
git commit -m "feat: build product inventory interface"
```

### Task 10: Interfaces de clientes e reparos

**Files:**
- Create: `frontend/customers.html`, `frontend/repairs.html`
- Create: `frontend/js/customers.js`, `frontend/js/repairs.js`, `frontend/js/repair-parts.js`
- Test: `tests/e2e/customers.spec.js`, `tests/e2e/repairs.spec.js`
- Modify: `frontend/css/style.css`, `Roadmap.md`, `Contexto.md`

**Interfaces:**
- Consumes: customer, repair, repair-part and product-search APIs.
- Produces: customer management, repair list/filters/form/detail/status badges, part selection, use/return feedback and responsive layouts.

- [ ] **Step 1: Write failing customer and repair E2E tests**

Cover customer creation/edit, repair creation/status update/filtering, detail fields, adding one available part, insufficient-stock warning, returning a part, and clear status presentation without color-only meaning.

- [ ] **Step 2: Run tests to verify RED**

Run: `npx playwright test tests/e2e/customers.spec.js tests/e2e/repairs.spec.js`
Expected: FAIL because pages do not exist.

- [ ] **Step 3: Implement customer and repair interfaces**

Reuse shared forms, dialogs, API client and feedback components; display the repair reference in part movements and refresh both repair and stock summaries after changes.

- [ ] **Step 4: Run E2E and full tests**

Run: `npx playwright test tests/e2e/customers.spec.js tests/e2e/repairs.spec.js && npm test && npx playwright test`
Expected: all commands PASS.

- [ ] **Step 5: Update docs and commit**

```bash
git add frontend tests Roadmap.md Contexto.md
git commit -m "feat: build repair shop interface"
```

### Task 11: Build, documentação completa e verificação local

**Files:**
- Create: `scripts/build-frontend.mjs`, `vercel.json`, `README.md`
- Create: `tests/integration/persistence.test.js`, `tests/e2e/full-flow.spec.js`
- Modify: `package.json`, `.gitignore`, `server.js`, `Roadmap.md`, `Contexto.md`, `api.md`

**Interfaces:**
- Produces: `npm run build` copying `frontend/` to ignored `public/`; local `npm start`; production-compatible Express export; complete operational documentation.

- [ ] **Step 1: Write failing build, persistence and full-flow checks**

Assert build output contains all pages/assets without source secrets, data survives closing/reopening PGlite, and one E2E flow creates a product, adds stock, creates a repair, consumes a part and sees updated dashboard/history.

- [ ] **Step 2: Run checks to verify RED**

Run: `npm run build && npm test -- tests/integration/persistence.test.js && npx playwright test tests/e2e/full-flow.spec.js`
Expected: FAIL until the build and full flow are implemented.

- [ ] **Step 3: Implement build and finalize documentation**

Complete `api.md` endpoint-by-endpoint with curl examples; make `Contexto.md` a concise current-state handoff; add setup, migration, seed, test and deployment commands to `README.md`; configure Vercel build and rewrites.

- [ ] **Step 4: Run the complete local verification cycle**

Run: `npm ci && npm run build && npm test && npx playwright test`
Expected: dependency install succeeds, build exits 0, and unit/integration/E2E suites report 0 failures.

- [ ] **Step 5: Inspect generated output and commit**

Run: `git diff --check && git status --short`
Expected: no whitespace errors and only intended source/documentation changes; `public/`, `.env` and test databases are ignored.

```bash
git add package.json package-lock.json scripts vercel.json README.md server.js .gitignore tests Roadmap.md Contexto.md api.md
git commit -m "docs: finalize local production workflow"
```

### Task 12: GitHub, Neon, Vercel e validação de produção

**Files:**
- Modify if required by deployment evidence: `.env.example`, `vercel.json`, `README.md`, `Roadmap.md`, `Contexto.md`, `api.md`
- Test: production smoke commands recorded in the final report.

**Interfaces:**
- Consumes: authenticated GitHub and Vercel accounts, public repository name `trabiagustavo`, production `DATABASE_URL`.
- Produces: public GitHub URL, production Vercel URL, migrated/seeded Neon database and final verified report.

- [ ] **Step 1: Verify local release candidate immediately before publishing**

Run: `npm ci && npm run build && npm test && npx playwright test && git status --short`
Expected: all commands PASS and working tree is clean.

- [ ] **Step 2: Create and push the public GitHub repository**

Create `trabiagustavo` under the authenticated GitHub account, preserve `main`, add `origin`, push commits, and verify the remote branch and public repository URL.

- [ ] **Step 3: Provision and migrate production PostgreSQL**

Create/link Neon through the Vercel Marketplace, configure `DATABASE_URL`, apply versioned migrations once, optionally seed demo data only with explicit `SEED_DEMO_DATA=true`, then disable that flag.

- [ ] **Step 4: Deploy production to Vercel**

Link the GitHub repository, deploy, inspect build/function logs, and record the immutable deployment plus production alias.

- [ ] **Step 5: Run production smoke tests**

Verify `GET /api/health`, load every page, create a uniquely named smoke product, add/remove/adjust stock, create a customer and repair, consume/return a part, confirm dashboard and history, then archive the smoke records where supported.

- [ ] **Step 6: Apply TDD fixes for any production-only issue**

For each issue, first add a failing automated regression test locally, confirm RED, implement the minimal fix, rerun the full suite, commit and redeploy.

- [ ] **Step 7: Final documentation and completion commit**

Record URLs, exact verification commands/results, known limitation (no authentication), startup instructions and recommended improvements. Mark only verified roadmap items complete.

```bash
git add Roadmap.md Contexto.md api.md README.md .env.example vercel.json
git commit -m "docs: record verified production release"
git push origin main
```

- [ ] **Step 8: Final evidence check**

Run: `git status --short`, `git log --oneline -5`, production health request, production page checks and the complete local test command once more.
Expected: clean tree, remote up to date, health 200, pages usable and all automated tests PASS.
