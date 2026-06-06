# Preço Confirmado-MVP Backend

Backend de portfólio para monitoramento de preços com dupla verificação. O sistema evita alertas baseados em preço vencido, falta de estoque, troca de vendedor, variante divergente, forma de pagamento desconhecida, cupom inconsistente ou notificação duplicada.

## Diferencial

Uma oferta abaixo da meta não gera alerta imediatamente:

```text
Scheduler/check-now
  -> consulta provider
  -> salva snapshot #1
  -> preço atingiu a meta?
       não: encerra
       sim: cria verificação PENDING_RECHECK
  -> scheduler de recheck consulta novamente
  -> salva snapshot #2
  -> compara produto, variante, preço, estoque, vendedor, pagamento e cupom
  -> calcula confiança
  -> HIGH + critérios obrigatórios
       -> cria Alert + NotificationOutbox na mesma transação
       -> dispatcher envia fora da transação e aplica retry
```

## Tecnologias

- Java 21 e Spring Boot 4.0.6
- Spring MVC, Data JPA, Security, OAuth2 Resource Server e Nimbus JWT
- PostgreSQL 16 e Flyway
- Spring Mail, Actuator e Springdoc OpenAPI 3.0.3 com Scalar
- JUnit, Mockito, Spring Security Test e Testcontainers 2
- Maven Wrapper, Docker Compose e GitHub Actions

Não usa H2, Lombok, MapStruct, scraping, filas ou microsserviços.

## Arquitetura

Monólito modular por funcionalidade:

```text
br.com.culturatech.precoconfirmado
├── auth
├── user
├── product
├── provider
│   ├── mock
│   └── mercadolivre
├── monitoring
├── verification
├── alert
├── notification
└── shared
```

Cada módulo separa, quando necessário, `api`, `application`, `domain` e `infrastructure`. Controllers trabalham com DTOs; entidades JPA não são expostas pela API.

## Modelo de dados

As migrations em `src/main/resources/db/migration` criam:

- `users` e `refresh_tokens`
- `tracked_products`
- `price_snapshots`
- `verification_attempts`
- `alerts`
- `notification_outbox`
- `mock_offers`

O schema usa UUID, `TIMESTAMPTZ`, `NUMERIC(19,2)`, JSONB, foreign keys, checks, índices parciais e chaves únicas de idempotência. O Hibernate roda com `ddl-auto=validate`.

## Confiança

| Critério | Pontos |
|---|---:|
| Produto e variante correspondem | 30 |
| Preço igual nas duas consultas | 25 |
| Estoque nas duas consultas | 15 |
| Vendedor identificado e consistente | 10 |
| Pagamento identificado e consistente | 10 |
| Cupom consistente | 5 |
| Recheck dentro da validade | 5 |

- `HIGH`: 90-100
- `MEDIUM`: 70-89
- `LOW`: 0-69

Somente `HIGH` pode avançar. Além do score, o alerta exige produto ativo, preço dentro da meta, mesmo `externalId`, variante compatível, estoque, moeda esperada, vendedor/pagamento/cupom consistentes e verificação não expirada.

## Segurança

- Senhas com BCrypt custo 12.
- Access token JWT HS256, 15 minutos por padrão.
- Refresh token opaco, aleatório, armazenado apenas como SHA-256.
- Refresh token rotacionado e anterior revogado a cada uso.
- Isolamento por proprietário; acesso alheio retorna 404.
- Rotas admin exigem `ROLE_ADMIN`.
- Rotas `/api/v1/dev/**` só existem no profile `dev`.
- CORS configurável; wildcard é rejeitado no profile `prod`.
- Correlation ID em `X-Correlation-ID` e respostas `ProblemDetail`.

## Execução com Docker

1. Copie os valores necessários de `.env.example` para um arquivo `.env`.
2. Troque obrigatoriamente `JWT_SECRET` e senhas antes de qualquer ambiente compartilhado.
3. Execute:

```bash
docker compose up --build
```

A API fica em `http://localhost:8080`. O PostgreSQL é publicado apenas em `127.0.0.1` para desenvolvimento. Para produção, remova a seção `ports` do serviço `postgres`.

Health check:

```bash
curl http://localhost:8080/actuator/health
```

## Execução local

Requer Java 21 e PostgreSQL.

Linux/macOS:

```bash
chmod +x mvnw
export DATABASE_URL=jdbc:postgresql://localhost:5432/preco_confirmado
export DATABASE_USERNAME=preco_confirmado
export DATABASE_PASSWORD=change-me
export JWT_SECRET='replace-with-at-least-32-random-bytes'
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Windows PowerShell:

```powershell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/preco_confirmado"
$env:DATABASE_USERNAME = "preco_confirmado"
$env:DATABASE_PASSWORD = "change-me"
$env:JWT_SECRET = "replace-with-at-least-32-random-bytes"
$env:SPRING_PROFILES_ACTIVE = "dev"
.\mvnw.cmd spring-boot:run
```

## Variáveis principais

Veja `.env.example` para a lista completa.

| Grupo | Variáveis |
|---|---|
| Banco | `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` |
| JWT | `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION` |
| CORS | `CORS_ALLOWED_ORIGINS` |
| Monitoramento | `MONITORING_ENABLED`, `MONITORING_BATCH_SIZE`, `MONITORING_SCHEDULER_DELAY`, `VERIFICATION_RECHECK_DELAY` |
| Duplicidade | `ALERT_DUPLICATE_COOLDOWN`, `ALERT_MINIMUM_ADDITIONAL_DROP_PERCENT` |
| Notificação | `NOTIFICATION_CHANNEL`, `MAIL_*` |
| Mercado Livre | `MERCADO_LIVRE_ENABLED`, `MERCADO_LIVRE_BASE_URL`, `MERCADO_LIVRE_ACCESS_TOKEN`, timeouts |
| Admin dev | `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`, `DEV_ADMIN_NAME` |

O admin de desenvolvimento só é criado quando e-mail e senha são fornecidos por ambiente.

O Docker Compose exige `JWT_SECRET`; não existe chave conhecida de fallback. A API limita páginas a 100 itens e usa a representação paginada estável do Spring Data.

## API e OpenAPI

- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Scalar: `http://localhost:8080/scalar`
- API base: `/api/v1`

Principais grupos:

- `/auth`: cadastro, login, refresh e logout
- `/users/me`
- `/tracked-products`: CRUD, pause/resume, históricos e `check-now`
- `/alerts`: consulta e leitura
- `/dev/mock-offers`: simulação protegida por ADMIN no profile dev
- `/admin`: execução manual de monitoramento, recheck e outbox

## Demonstração

Defina um admin antes de subir:

```powershell
$env:DEV_ADMIN_EMAIL = "admin@example.com"
$env:DEV_ADMIN_PASSWORD = "ChangeThisPassword123"
$env:DEV_ADMIN_NAME = "Portfolio Admin"
docker compose up --build
```

Login em PowerShell:

```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"ChangeThisPassword123"}'
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
```

Crie uma oferta MOCK:

```powershell
$offer = @{
  externalId = "NOTEBOOK-001"; title = "Notebook Modelo X 16 GB 512 GB"
  price = 3999.00; regularPrice = 4299.00; currency = "BRL"
  paymentType = "PIX"; sellerId = "SELLER-1"; sellerName = "Loja Exemplo"
  condition = "NEW"; color = "Preto"; storage = "512GB"
  inStock = $true; availableQuantity = 5; couponRequired = $false
  sourceUrl = "https://loja-teste.local/produtos/notebook-001"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Headers $headers -ContentType "application/json" `
  -Uri "http://localhost:8080/api/v1/dev/mock-offers" -Body $offer
```

Cadastre o produto:

```powershell
$productBody = @{
  providerCode = "MOCK"; externalId = "NOTEBOOK-001"
  sourceUrl = "https://loja-teste.local/produtos/notebook-001"
  title = "Notebook Modelo X 16 GB 512 GB"; brand = "Marca Exemplo"; model = "Modelo X"
  color = "Preto"; storage = "512GB"; condition = "NEW"
  targetPrice = 3500.00; currency = "BRL"; checkIntervalMinutes = 30
} | ConvertTo-Json
$product = Invoke-RestMethod -Method Post -Headers $headers -ContentType "application/json" `
  -Uri "http://localhost:8080/api/v1/tracked-products" -Body $productBody
```

Altere a oferta para `3499.00`, execute a primeira consulta e, após o intervalo mínimo, o recheck:

```powershell
$offerObject = $offer | ConvertFrom-Json
$offerObject.price = 3499.00
$updated = $offerObject | ConvertTo-Json
Invoke-RestMethod -Method Put -Headers $headers -ContentType "application/json" `
  -Uri "http://localhost:8080/api/v1/dev/mock-offers/NOTEBOOK-001" -Body $updated
Invoke-RestMethod -Method Post -Headers $headers `
  -Uri "http://localhost:8080/api/v1/tracked-products/$($product.id)/check-now"
```

Depois de `VERIFICATION_RECHECK_DELAY`:

```powershell
Invoke-RestMethod -Method Post -Headers $headers `
  -Uri "http://localhost:8080/api/v1/admin/monitoring/recheck-pending"
Invoke-RestMethod -Headers $headers -Uri "http://localhost:8080/api/v1/alerts"
Invoke-RestMethod -Headers $headers -Uri "http://localhost:8080/api/v1/admin/notifications/outbox"
```

Equivalente resumido com curl:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"ChangeThisPassword123"}'

curl -X POST http://localhost:8080/api/v1/admin/monitoring/recheck-pending \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Para demonstrar rejeição, altere vendedor, cor, armazenamento, estoque ou preço entre as duas consultas. A verificação será `REJECTED`, guardará os motivos e não criará alerta/outbox.

## Mercado Livre

Ative com `MERCADO_LIVRE_ENABLED=true`. O provider usa `RestClient`, `GET /items/{id}` e, quando há token, o recurso oficial `GET /items/{id}/sale_price?context=channel_marketplace`. Erros 400/401/403/404/429/5xx são tratados sem produzir alertas.

Dados ausentes não são inventados. Como a resposta padrão não garante forma de pagamento, ela fica `UNKNOWN`; nesse caso o snapshot é preservado, mas o alerta é bloqueado por confiança.

## Testes

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

```bash
./mvnw test
./mvnw package
```

Os testes de integração usam PostgreSQL real via Testcontainers. Sem Docker, eles são ignorados localmente; no GitHub Actions são executados no runner Linux com Docker disponível.

## Migrations

O Flyway executa automaticamente as migrations `V1` a `V7`. Não altere migrations já aplicadas; crie uma nova versão para mudanças futuras.

## Decisões técnicas

- Chamadas externas acontecem fora de transações longas.
- Recheck é persistido e retomado pelo scheduler, sem bloquear thread.
- Alert e outbox são gravados atomicamente.
- Dispatcher usa claim com lock pessimista e retry 1 min, 5 min, 30 min e 2 h; depois marca `DEAD`.
- Chaves SHA-256 determinísticas e constraints únicas defendem contra concorrência.
- Exclusão de produto é lógica.

## Limitações atuais

- Apenas providers MOCK e Mercado Livre.
- Sem cálculo de frete.
- E-mail é texto simples.
- O provider Mercado Livre não inventa condição de pagamento ausente e, por isso, pode registrar snapshots sem aprovar alertas.
- Testcontainers requer um ambiente Docker compatível.

## Evoluções possíveis

- Métricas de negócio e dashboards.
- Locks distribuídos para múltiplas réplicas.
- Templates HTML de e-mail.
- Mais providers por APIs oficiais.
- Webhooks de preço quando oferecidos pelo provider.

## Licença

MIT. Consulte `LICENSE`.
