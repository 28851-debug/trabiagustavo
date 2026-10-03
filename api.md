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

Os demais endpoints serão adicionados a este documento junto com suas implementações e testes.

## Categorias

`GET /api/categories` lista categorias. `POST /api/categories` cria, `PUT /api/categories/:id` altera e `DELETE /api/categories/:id` remove uma categoria sem produtos.

Corpo de criação/edição:

```json
{ "name": "Phone Cases" }
```

Criação responde `201`; listagem/edição respondem `200`; exclusão responde `204`. Nome vazio gera `400 VALIDATION_ERROR`, nome normalizado duplicado gera `409 DUPLICATE_CATEGORY`, ID ausente gera `404 NOT_FOUND` e categoria em uso gera `409 RESOURCE_IN_USE`.

```bash
curl -X POST http://localhost:3000/api/categories -H "Content-Type: application/json" -d '{"name":"Phone Cases"}'
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
```
