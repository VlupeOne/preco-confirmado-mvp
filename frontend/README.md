# Preço Confirmado-MVP | Frontend

Frontend do MVP de monitoramento de preços com dupla verificação antes da criação de alertas. A aplicação usa Next.js com App Router e funciona como uma camada BFF entre o navegador e a API Spring Boot.

## Stack

- Next.js 16, React 19 e TypeScript strict
- Tailwind CSS 4, shadcn/base-ui, Lucide e Recharts
- TanStack Query, React Hook Form e Zod
- OpenAPI TypeScript e openapi-fetch
- Vitest, Testing Library, MSW e Playwright
- Docker standalone com Node.js 22

## Arquitetura

O navegador não recebe os tokens JWT do backend. Login, cadastro, refresh e logout passam por Route Handlers do Next.js, que armazenam os tokens em cookies `HttpOnly`.

As chamadas autenticadas usam `/api/bff/*`. Essa camada:

- aceita apenas caminhos explicitamente permitidos;
- bloqueia traversal, URLs absolutas e codificações suspeitas;
- valida origem em requisições de escrita;
- limita tamanho e duração das requisições;
- encaminha somente headers necessários;
- tenta um único refresh em respostas `401`;
- evita cache de respostas autenticadas.

## Rotas

| Rota                       | Finalidade                            |
| -------------------------- | ------------------------------------- |
| `/`                        | Landing page                          |
| `/login` e `/register`     | Autenticação                          |
| `/dashboard`               | Resumo do monitoramento               |
| `/products`                | Produtos e filtros                    |
| `/products/new`            | Novo monitoramento                    |
| `/products/[id]`           | Histórico, verificações e alertas     |
| `/products/[id]/edit`      | Edição                                |
| `/alerts` e `/alerts/[id]` | Alertas confirmados                   |
| `/admin/demo`              | Cenários MOCK e ações administrativas |

## Desenvolvimento local

Pré-requisitos: Node.js 22+, npm e backend disponível em `http://localhost:8080`.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Acesse `http://localhost:3000`.

Variáveis principais:

| Variável                   | Padrão                              | Uso                     |
| -------------------------- | ----------------------------------- | ----------------------- |
| `BACKEND_URL`              | `http://localhost:8080`             | URL interna da API      |
| `BACKEND_OPENAPI_URL`      | `http://localhost:8080/v3/api-docs` | Atualização do contrato |
| `AUTH_ACCESS_COOKIE_NAME`  | `pc_access_token`                   | Cookie de acesso        |
| `AUTH_REFRESH_COOKIE_NAME` | `pc_refresh_token`                  | Cookie de refresh       |
| `AUTH_COOKIE_SECURE`       | `false` em dev, `true` em produção  | Exige HTTPS para cookie |
| `BFF_REQUEST_TIMEOUT_MS`   | `15000`                             | Timeout do proxy        |
| `BFF_MAX_BODY_BYTES`       | `1048576`                           | Limite de payload       |
| `NEXT_PUBLIC_APP_URL`      | `http://localhost:3000`             | Origem pública          |

Não versione arquivos `.env` reais.

## OpenAPI

O contrato usado pelo frontend fica versionado em `openapi/preco-confirmado.openapi.json`.

```bash
npm run api:download
npm run api:generate
npm run api:check
```

`api:check` falha quando o tipo gerado está diferente do contrato versionado.

## Qualidade

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:e2e
npm run build
```

Para executar a validação principal em sequência:

```bash
npm run check
```

Os E2E usam respostas controladas e cobrem login/logout, criação e consulta de produto, detalhe de alerta e autorização administrativa em desktop e mobile.

## Docker

Com o backend já em execução:

```bash
docker build -t preco-confirmado-frontend .
docker run --rm -p 3000:3000 \
  -e BACKEND_URL=http://host.docker.internal:8080 \
  -e AUTH_COOKIE_SECURE=false \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  preco-confirmado-frontend
```

No Linux, adicione `--add-host=host.docker.internal:host-gateway`.

Healthcheck: `http://localhost:3000/api/health`.

## CI

O workflow `frontend-ci.yml` executa:

1. contrato OpenAPI, typecheck, lint e formatação;
2. testes Vitest e build de produção;
3. Playwright com Chromium;
4. build da imagem Docker.
