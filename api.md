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
