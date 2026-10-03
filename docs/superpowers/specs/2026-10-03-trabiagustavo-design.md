# Especificação técnica — Trabiagustavo

## 1. Objetivo

Criar do zero um sistema web profissional para uma loja brasileira de eletrônicos e assistência técnica. O produto deve controlar catálogo, estoque, clientes e ordens de serviço, preservando um histórico auditável de todas as alterações de saldo. A primeira versão atende uma única loja, sem autenticação, e será preparada para futura inclusão de usuários e permissões.

O resultado será publicado em um repositório público do GitHub chamado `trabiagustavo` e implantado na Vercel.

## 2. Critérios de sucesso

- Produtos, categorias, fornecedores, clientes e ordens de serviço podem ser administrados pela interface.
- Busca localiza produtos por nome, SKU, marca, compatibilidade e categoria.
- Entradas, saídas, ajustes, consumo em reparos e devoluções são calculados exclusivamente pelo backend.
- Nenhuma operação pode deixar o estoque negativo.
- A alteração do saldo e a criação da movimentação correspondente são atômicas.
- Peças confirmadas em reparos reduzem o estoque e registram a ordem de serviço como referência.
- O dashboard apresenta indicadores úteis e dados consistentes com o banco.
- A interface funciona em computadores, tablets e celulares.
- A API, o roadmap e a memória técnica permanecem sincronizados com o código.
- Testes automatizados cobrem as regras críticas e um teste final valida a implantação.

## 3. Escopo da primeira versão

### Incluído

- Dashboard de estoque e reparos.
- CRUD e arquivamento de produtos.
- Categorias e fornecedores administráveis.
- Entrada, saída e ajuste de estoque.
- Histórico permanente de movimentações.
- Busca, filtros e paginação de produtos.
- Indicadores de estoque normal, baixo e esgotado.
- Cadastro e consulta de clientes.
- CRUD de ordens de serviço e atualização de status.
- Associação e remoção de peças em ordens de serviço com integração ao estoque.
- Documentação da API e instruções operacionais.
- Repositório público no GitHub e implantação na Vercel.

### Fora do escopo inicial

- Autenticação, níveis de acesso e múltiplas lojas.
- Vendas, caixa, emissão fiscal ou integração contábil.
- Upload de imagens e anexos.
- Notificações por WhatsApp, SMS ou e-mail.
- Aplicativo móvel nativo.

## 4. Arquitetura

### 4.1 Tecnologias

- Node.js 20 ou superior.
- Express para a API REST e entrega local da aplicação.
- PostgreSQL hospedado no Neon em produção.
- Drizzle ORM e migrations SQL versionadas.
- Zod para validação de entrada.
- HTML, CSS e JavaScript modular sem framework no frontend.
- Vitest e Supertest para testes automatizados.
- Playwright para os fluxos essenciais da interface.
- Vercel para frontend, função Express e integração com o banco.

SQLite não será usado em produção porque o sistema de arquivos das funções da Vercel é efêmero. O Express será exportado por um ponto de entrada reconhecido pela Vercel e executado como uma única Vercel Function. O código-fonte do frontend continuará em `frontend/`; o processo de build copiará somente os ativos publicáveis para o diretório de saída servido pela CDN.

### 4.2 Organização do backend

- `routes`: definição declarativa dos endpoints.
- `controllers`: adaptação entre HTTP e casos de uso.
- `services`: regras de negócio e limites transacionais.
- `repositories`: persistência e consultas.
- `schemas`: validação e normalização dos dados de entrada.
- `database`: conexão, schema, migrations e seeds.
- `middleware`: erros, segurança, logs e rota inexistente.

Controladores não calculam estoque e repositórios não contêm regras de negócio. Serviços coordenam as transações e dependem de interfaces de repositório que podem ser exercitadas isoladamente nos testes.

### 4.3 Organização do frontend

O frontend terá páginas para dashboard, produtos, clientes e reparos. Categorias e fornecedores serão administrados por painéis acessíveis a partir da área de produtos. JavaScript será separado por responsabilidade: cliente HTTP, componentes compartilhados, formatação, estado de interface e controladores de cada página.

No desktop, a aplicação usará navegação lateral, cards compactos e tabelas. Em telas menores, a navegação será recolhida e as tabelas terão rolagem horizontal ou visualização em cartões. Operações assíncronas terão carregamento, bloqueio contra clique repetido e feedback de sucesso ou erro.

## 5. Modelo de dados

### 5.1 Categorias

`categories` contém identificador, nome único, datas de criação e atualização. Categorias referenciadas por produtos não podem ser excluídas.

### 5.2 Fornecedores

`suppliers` contém identificador, nome, telefone, e-mail, observações e datas. Fornecedores referenciados por produtos não podem ser excluídos.

### 5.3 Produtos

`products` contém identificador, SKU único, nome, categoria, marca, compatibilidade, custo em centavos, preço de venda em centavos, quantidade, estoque mínimo, fornecedor opcional, observações, data de criação, atualização e arquivamento opcional.

Produtos com histórico não são apagados fisicamente. A exclusão solicitada pela interface arquiva o produto, que deixa de aparecer nas listagens normais e não aceita novas movimentações. O histórico continua acessível.

### 5.4 Movimentações

`inventory_movements` contém identificador, produto, tipo, quantidade positiva, saldo anterior, novo saldo, tipo e identificador de referência opcionais, observação e data.

Tipos permitidos:

- `IN`: entrada, inclusive saldo inicial.
- `OUT`: saída comum.
- `ADJUSTMENT`: correção para um saldo absoluto informado.
- `REPAIR_USAGE`: consumo confirmado por ordem de serviço.
- `RETURN`: devolução ao remover uma peça já confirmada de uma ordem.

Para ajustes, `quantity` registra o valor absoluto da diferença; `previous_stock` e `new_stock` preservam a direção e permitem reconstruir a operação sem ambiguidade.

### 5.5 Clientes

`customers` contém identificador, nome, telefone, e-mail opcional, observações e datas. Um cliente pode possuir várias ordens de serviço.

### 5.6 Ordens de serviço

`repair_orders` contém identificador, cliente, aparelho, marca, modelo, cor, IMEI ou número de série, problema relatado, diagnóstico, técnico responsável opcional, notas técnicas, preço e custo em centavos, status, data de entrada, previsão, conclusão e datas de auditoria.

Status permitidos: `RECEIVED`, `DIAGNOSIS`, `WAITING_APPROVAL`, `WAITING_PART`, `IN_REPAIR`, `READY`, `DELIVERED` e `CANCELLED`.

### 5.7 Peças usadas

`repair_parts` contém identificador, ordem, produto, quantidade, custo unitário em centavos e data. O custo unitário é capturado no momento do consumo para não mudar quando o preço do produto for atualizado.

## 6. Regras de negócio e transações

### 6.1 Criação de produto

SKU, nome, categoria, preços, saldo e estoque mínimo são validados no backend. SKU é normalizado, não pode ser vazio nem duplicado. Valores monetários e quantidades não podem ser negativos. Um saldo inicial positivo gera uma movimentação `IN` com a observação `Estoque inicial`, dentro da mesma transação da criação.

### 6.2 Entrada e saída

O cliente envia somente a quantidade positiva da movimentação. O serviço abre uma transação, bloqueia a linha do produto, lê o saldo atual, calcula o novo saldo, atualiza o produto, cria a movimentação e confirma a transação. Uma saída maior que o saldo disponível responde com conflito e não altera dado algum.

### 6.3 Ajuste

O cliente envia o saldo físico correto e uma justificativa obrigatória. O backend calcula a diferença. Ajuste sem alteração de saldo é rejeitado. A atualização e o registro `ADJUSTMENT` ocorrem na mesma transação.

### 6.4 Peças em reparos

Adicionar uma peça valida a ordem, o produto ativo e a quantidade disponível. A criação de `repair_parts`, a redução do saldo e a movimentação `REPAIR_USAGE` com referência à ordem ocorrem atomicamente. Remover uma peça confirmada executa a operação inversa e gera `RETURN`. Repetições simultâneas são serializadas pelo bloqueio da linha do produto.

### 6.5 Exclusões

- Produto sem dependências também será arquivado, mantendo uma única semântica segura de exclusão.
- Categoria ou fornecedor em uso responde com conflito.
- Cliente com ordem de serviço não pode ser excluído na primeira versão.
- Ordem que possui peças confirmadas não pode ser excluída; pode ser cancelada sem devolver peças automaticamente. A devolução precisa ser explícita para manter o histórico verificável.

## 7. API

Todos os endpoints usam o prefixo `/api`, JSON e códigos HTTP coerentes.

- `/api/health`: diagnóstico básico.
- `/api/dashboard`: indicadores, alertas e movimentos recentes.
- `/api/products`: listagem, criação, detalhe, edição e arquivamento.
- `/api/products/:id/stock/add`: entrada.
- `/api/products/:id/stock/remove`: saída.
- `/api/products/:id/stock/adjust`: ajuste.
- `/api/products/:id/movements`: histórico do produto.
- `/api/categories`: CRUD de categorias.
- `/api/suppliers`: CRUD de fornecedores.
- `/api/inventory/movements`: histórico global paginado.
- `/api/customers`: CRUD de clientes, com restrição de exclusão.
- `/api/repairs`: CRUD e filtros de ordens.
- `/api/repairs/:id/parts`: consumo de peça.
- `/api/repairs/:id/parts/:partId`: devolução e remoção de peça.

Listagens aceitam paginação e os filtros próprios do recurso. O formato de erro é estável:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Estoque insuficiente.",
    "details": {
      "available": 5,
      "requested": 10
    }
  }
}
```

Erros de validação usam `400`, ausência usa `404`, conflitos de estado ou unicidade usam `409` e falhas inesperadas usam `500` sem expor detalhes internos.

## 8. Dashboard e consultas

O dashboard calcula no banco:

- total de produtos ativos;
- total de unidades;
- valor de custo do estoque;
- valor potencial de venda;
- quantidade de itens com estoque baixo;
- quantidade de itens esgotados;
- ordens de serviço ativas;
- movimentos recentes;
- produtos com maior estoque.

Estoque baixo significa quantidade maior que zero e menor ou igual ao mínimo configurado. Estoque esgotado significa quantidade igual a zero. Ordens ativas excluem `DELIVERED` e `CANCELLED`.

Busca de produtos cobre nome, SKU, marca, compatibilidade e nome da categoria, sem diferenciar maiúsculas e minúsculas. Filtros incluem categoria, marca, compatibilidade, situação do estoque e faixa de preço de venda. Reparos aceitam status, cliente, aparelho, técnico e intervalo da data de entrada; como a primeira versão não possui usuários, técnico será um campo textual opcional na ordem.

## 9. Experiência e apresentação

- Idioma principal: português do Brasil.
- Valores exibidos com `Intl.NumberFormat` em `pt-BR` e moeda `BRL`.
- Datas exibidas no fuso `America/Sao_Paulo`; persistência em UTC.
- Visual administrativo profissional, neutro e compacto.
- Cores de estado consistentes, contraste adequado e foco de teclado visível.
- Formulários com validação próxima ao campo e resumo de erro quando necessário.
- Ações destrutivas e ajustes exigem confirmação explícita.
- Informações críticas não dependem apenas de cor.

## 10. Segurança e confiabilidade

- Validação de todo dado recebido pelo backend.
- Consultas parametrizadas pelo ORM.
- Cabeçalhos de segurança e limite de tamanho do corpo HTTP.
- CORS restrito à mesma origem em produção.
- Credenciais somente em variáveis de ambiente.
- Tratamento centralizado de erros e logs sem dados pessoais desnecessários.
- Migrations versionadas e reversíveis quando tecnicamente seguro.
- Transações e bloqueios para todas as alterações concorrentes de estoque.

Autenticação não integra a primeira versão. Por isso, a implantação inicial é apropriada para avaliação e uso controlado; antes de expor dados reais publicamente, autenticação e autorização devem ser adicionadas.

## 11. Estratégia de testes

- Testes unitários das validações e regras de cálculo.
- Testes de integração da API com PGlite temporário, executando o mesmo schema PostgreSQL versionado usado em produção.
- Testes de criação, SKU duplicado, preços inválidos e quantidades negativas.
- Testes de entradas sequenciais, saídas e insuficiência de estoque.
- Testes de ajustes e histórico gerado.
- Testes de consumo, insuficiência e devolução de peças.
- Testes de arquivamento e restrições de exclusão.
- Teste concorrente para impedir saldo negativo em requisições simultâneas.
- Testes de migrations e persistência após reconexão.
- Fluxos Playwright para dashboard, produto, movimentação e reparo.
- Smoke tests de API e páginas na URL final da Vercel.

Cada comportamento novo seguirá o ciclo teste falhando, implementação mínima e suíte verde. `Roadmap.md`, `Contexto.md` e `api.md` serão atualizados junto com a funcionalidade correspondente.

## 12. Estrutura planejada

```text
/
├── frontend/
│   ├── index.html
│   ├── products.html
│   ├── customers.html
│   ├── repairs.html
│   ├── css/
│   └── js/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── database/
│       ├── middleware/
│       ├── repositories/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       └── server.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── docs/superpowers/
├── Roadmap.md
├── Contexto.md
├── api.md
├── package.json
└── vercel.json
```

## 13. Entrega e operação

O projeto usará a branch principal `main`. A implementação será versionada no repositório público `trabiagustavo`. A Vercel será conectada ao repositório, receberá `DATABASE_URL` e fará o deploy do Express e dos ativos estáticos. O banco Neon será criado na mesma região ou na mais próxima disponível da função para reduzir latência.

Antes da entrega serão executados, em uma rodada nova, testes unitários, integração, E2E, build, migrations em ambiente limpo e smoke tests da implantação. O relatório final registrará os comandos, resultados, URL pública, limitações e próximos passos.
