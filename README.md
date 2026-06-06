# Preço Confirmado-MVP

MVP de portfólio para monitoramento de preços com dupla verificação antes do envio de alertas.

## Estrutura

```text
Preço Confirmado/
├── backend/     API Spring Boot, PostgreSQL, monitoramento e notificações
└── frontend/    Next.js, BFF seguro, dashboard e interface responsiva
```

Backend e frontend possuem dependências, documentação, Dockerfile e pipeline próprios.

## Funcionalidades

- autenticação JWT protegida por cookies `HttpOnly` no BFF;
- cadastro e gerenciamento de produtos monitorados;
- histórico real de preços e gráficos sem dados inventados;
- dupla consulta com score, confiança e critérios de aprovação;
- alertas confirmados com economia, vendedor, variante e pagamento;
- área administrativa para ofertas MOCK, monitoramento, rechecagens e outbox;
- temas claro, escuro e sistema;
- interface responsiva e estados de loading, vazio, erro e permissão.

## Executar o backend

```bash
cd backend
docker compose up --build
```

- API: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`
- OpenAPI: `http://localhost:8080/v3/api-docs`
- Scalar: `http://localhost:8080/scalar`

Consulte [backend/README.md](backend/README.md).

## Executar o frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Acesse `http://localhost:3000`.

Consulte [frontend/README.md](frontend/README.md) para arquitetura, segurança, OpenAPI, testes e Docker.

## Validação

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run check
npm run test:e2e
```

Os workflows em `.github/workflows` validam os dois módulos separadamente.

## Metodologia de desenvolvimento

Este MVP foi desenvolvido em um fluxo de vibe coding assistido por IA, com decisões conduzidas e revisadas pelo autor. O processo envolveu análise de requisitos e contratos, pesquisa técnica, validação crítica, testes automatizados e integração real com Docker. A IA foi utilizada como ferramenta de apoio à investigação e implementação; a responsabilidade pelas escolhas, revisão e resultado final permanece com o autor.

## Licença

MIT. Consulte [LICENSE](LICENSE).
