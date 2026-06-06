# Preço Confirmado-MVP

MVP de portfólio para monitoramento de preços com dupla verificação antes do envio de alertas.

## Estrutura

```text
preco-confirmado-mvp/
├── backend/     API Spring Boot, PostgreSQL, Docker e documentação técnica
└── frontend/    planejado para a próxima etapa
```

## Backend

O backend já implementa autenticação JWT, CRUD de produtos monitorados, providers MOCK e Mercado Livre, dupla verificação, score de confiança, alertas e outbox transacional.

Documentação completa: [backend/README.md](backend/README.md)

Para executar:

```bash
cd backend
docker compose up --build
```

- API: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`
- OpenAPI: `http://localhost:8080/v3/api-docs`
- Scalar: `http://localhost:8080/scalar`

## Status

- Backend: concluído e validado com Docker e Testcontainers
- Frontend: próxima etapa

## Licença

MIT. Consulte [LICENSE](LICENSE).
