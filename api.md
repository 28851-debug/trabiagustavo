# API — Trabiagustavo

## Convenções

- URL base local: `http://localhost:3000/api`
- Conteúdo: `application/json`
- Valores monetários: centavos inteiros
- Datas: ISO 8601 em UTC

Erros seguem este formato:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensagem útil em português.",
    "details": {}
  }
}
```

## Verificar saúde

### Método e rota

`GET /api/health`

### Objetivo

Confirmar que a aplicação HTTP está disponível. Este endpoint não consulta o banco.

### Parâmetros

Nenhum.

### Corpo da requisição

Nenhum.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "status": "ok"
}
```

### Validação

Não se aplica.

### Possíveis erros

Uma indisponibilidade de infraestrutura pode impedir a conexão HTTP. O endpoint não produz erro de negócio.

### Exemplo

```bash
curl http://localhost:3000/api/health
```

## Rota inexistente

Qualquer método ou caminho sem rota registrada responde com `404`:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso não encontrado.",
    "details": {
      "method": "GET",
      "path": "/api/exemplo"
    }
  }
}
```

## Categorias

`GET /api/categories` lista categorias. `POST /api/categories` cria, `PUT /api/categories/:id` altera e `DELETE /api/categories/:id` remove uma categoria sem produtos.

Corpo de criação/edição:

```json
{ "name": "Phone Cases" }
```

Criação responde `201`; listagem/edição respondem `200`; exclusão responde `204`. Nome vazio gera `400 VALIDATION_ERROR`, nome normalizado duplicado gera `409 DUPLICATE_CATEGORY`, ID ausente gera `404 NOT_FOUND` e categoria em uso gera `409 RESOURCE_IN_USE`.

```bash
curl -X POST http://localhost:3000/api/categories -H "Content-Type: application/json" -d '{"name":"Phone Cases"}'
curl http://localhost:3000/api/categories
curl -X PUT http://localhost:3000/api/categories/1 -H "Content-Type: application/json" -d '{"name":"Capas"}'
curl -X DELETE http://localhost:3000/api/categories/1
```

## Fornecedores

`GET /api/suppliers` lista fornecedores. `POST /api/suppliers` cria, `PUT /api/suppliers/:id` substitui os dados e `DELETE /api/suppliers/:id` remove um fornecedor sem produtos.

```json
{
  "name": "Distribuidora Sul",
  "phone": "11999999999",
  "email": "vendas@sul.com",
  "notes": "Preferencial"
}
```

`name` é obrigatório; telefone, e-mail e observações são opcionais. E-mail inválido gera `400 VALIDATION_ERROR`, nome duplicado gera `409 DUPLICATE_SUPPLIER`, ID ausente gera `404 NOT_FOUND` e fornecedor em uso gera `409 RESOURCE_IN_USE`.

```bash
curl -X POST http://localhost:3000/api/suppliers -H "Content-Type: application/json" -d '{"name":"Distribuidora Sul"}'
curl http://localhost:3000/api/suppliers
curl -X PUT http://localhost:3000/api/suppliers/1 -H "Content-Type: application/json" -d '{"name":"Distribuidora Sul","phone":"11999999999"}'
curl -X DELETE http://localhost:3000/api/suppliers/1
```

## Produtos

- `GET /api/products`: lista com `page`, `pageSize`, `search`, `categoryId`, `brand`, `compatibility`, `stockStatus`, `minPriceCents` e `maxPriceCents`.
- `GET /api/products/:id`: detalhe com categoria, fornecedor, custo total e valor potencial.
- `POST /api/products`: cria e registra `IN` quando o saldo inicial é positivo.
- `PUT /api/products/:id`: altera dados cadastrais; não aceita `quantity`.
- `DELETE /api/products/:id`: arquiva e responde `204`.

```json
{
  "sku": "CASE-IP15PM-BLK",
  "name": "Capa de silicone iPhone 15 Pro Max",
  "category_id": 1,
  "brand": "Generic",
  "compatibility": "iPhone 15 Pro Max",
  "cost_price_cents": 2000,
  "sale_price_cents": 4990,
  "quantity": 50,
  "minimum_stock": 5,
  "supplier_id": null,
  "notes": null
}
```

Criação válida responde `201`. Campos inválidos respondem `400 VALIDATION_ERROR`, SKU duplicado `409 DUPLICATE_SKU`, categoria/fornecedor inexistente `404 NOT_FOUND`.

```bash
curl "http://localhost:3000/api/products?search=iphone&stockStatus=low"
curl http://localhost:3000/api/products/1
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"sku":"CASE-IP15PM-BLK","name":"Capa iPhone 15","category_id":1,"cost_price_cents":2000,"sale_price_cents":4990,"quantity":50,"minimum_stock":5}'
curl -X PUT http://localhost:3000/api/products/1 -H "Content-Type: application/json" -d '{"sku":"CASE-IP15PM-BLK","name":"Capa iPhone 15 Pro","category_id":1,"cost_price_cents":2000,"sale_price_cents":5490,"minimum_stock":5}'
curl -X DELETE http://localhost:3000/api/products/1
```

## Estoque e movimentações

- `POST /api/products/:id/stock/add` — corpo `{ "quantity": 20, "note": "Compra" }`.
- `POST /api/products/:id/stock/remove` — mesma estrutura; saldo insuficiente gera `409 INSUFFICIENT_STOCK`.
- `POST /api/products/:id/stock/adjust` — corpo `{ "new_stock": 17, "reason": "Contagem física" }`.
- `GET /api/products/:id/movements` — histórico paginado do produto.
- `GET /api/inventory/movements` — histórico global paginado.

As operações respondem com `type`, `quantity`, `previous_stock`, `new_stock`, observação e data. Quantidades devem ser inteiras positivas; ajuste exige saldo inteiro não negativo e justificativa.

```bash
curl -X POST http://localhost:3000/api/products/1/stock/add -H "Content-Type: application/json" -d '{"quantity":20,"note":"Compra"}'
curl -X POST http://localhost:3000/api/products/1/stock/remove -H "Content-Type: application/json" -d '{"quantity":2,"note":"Venda"}'
curl -X POST http://localhost:3000/api/products/1/stock/adjust -H "Content-Type: application/json" -d '{"new_stock":17,"reason":"Contagem física"}'
curl http://localhost:3000/api/products/1/movements
curl http://localhost:3000/api/inventory/movements
```

## Clientes e reparos

`/api/customers` oferece `GET`, `POST`, `GET /:id`, `PUT /:id` e `DELETE /:id`. Nome e telefone são obrigatórios; cliente com reparos retorna `409 RESOURCE_IN_USE` ao excluir.

`/api/repairs` oferece os mesmos métodos e aceita filtros `status`, `customer`, `device`, `technician`, `entryDateFrom` e `entryDateTo`. Criação exige `customer_id`, `device`, `reported_problem`, `price_cents` e `cost_cents`. `GET /api/repairs/:id` também retorna `parts`, com nome/SKU do produto, quantidade e custo capturado. Status válidos: `RECEIVED`, `DIAGNOSIS`, `WAITING_APPROVAL`, `WAITING_PART`, `IN_REPAIR`, `READY`, `DELIVERED`, `CANCELLED`.

`POST /api/repairs/:id/parts` recebe `{ "product_id": 1, "quantity": 1 }`, responde `201` e cria `REPAIR_USAGE`. `DELETE /api/repairs/:id/parts/:partId` responde `204`, devolve o saldo e cria `RETURN`. Estoque insuficiente responde `409` sem alterações parciais.

```bash
curl http://localhost:3000/api/customers
curl -X POST http://localhost:3000/api/customers -H "Content-Type: application/json" -d '{"name":"Ana","phone":"11999999999","email":"ana@example.com"}'
curl http://localhost:3000/api/customers/1
curl "http://localhost:3000/api/repairs?status=RECEIVED"
curl -X POST http://localhost:3000/api/repairs -H "Content-Type: application/json" -d '{"customer_id":1,"device":"iPhone 13","reported_problem":"Não liga","price_cents":30000,"cost_cents":10000}'
curl http://localhost:3000/api/repairs/1
curl -X POST http://localhost:3000/api/repairs/1/parts -H "Content-Type: application/json" -d '{"product_id":1,"quantity":1}'
curl -X DELETE http://localhost:3000/api/repairs/1/parts/1
```

## Dashboard

`GET /api/dashboard` retorna `total_products`, `total_units`, `inventory_cost_cents`, `potential_retail_cents`, `low_stock_count`, `out_of_stock_count`, `active_repairs`, `recent_movements` e `highest_stock_products`.

```bash
curl http://localhost:3000/api/dashboard
```
