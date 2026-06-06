import { expect, test } from "@playwright/test";

import {
  adminSession,
  alert,
  apiPath,
  authenticate,
  fulfillJson,
  mockSession,
  pageOf,
  product,
  snapshots,
  userSession,
  verification,
} from "./support";

test("entra, navega pelo dashboard e encerra a sessão", async ({
  page,
  context,
}) => {
  await page.route("**/api/auth/login", (route) =>
    fulfillJson(route, { authenticated: true }),
  );
  await mockSession(page);
  await page.route("**/api/bff/**", (route) => fulfillJson(route, pageOf([])));

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(userSession.email);
  await page.getByLabel("Senha", { exact: true }).fill("Password123");
  await authenticate(context);
  await page.getByRole("button", { name: "Entrar com segurança" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Seu monitoramento" }),
  ).toBeVisible();

  const accountMenu = page.getByRole("button", { name: /^AS/ });
  await accountMenu.click();
  await expect(page.getByText(userSession.email)).toBeVisible();
  await context.clearCookies();
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({ status: 204 }),
  );
  await page.getByRole("menuitem", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/login$/);
});

test("cria um produto, abre o detalhe e solicita verificação", async ({
  page,
  context,
}) => {
  await authenticate(context);
  await mockSession(page);

  let createRequested = false;
  let checkRequested = false;
  await page.route("**/api/bff/**", async (route) => {
    const path = apiPath(route);
    const method = route.request().method();

    if (path === "/api/v1/tracked-products" && method === "POST") {
      createRequested = true;
      return fulfillJson(route, product, 201);
    }
    if (
      path === `/api/v1/tracked-products/${product.id}/check-now` &&
      method === "POST"
    ) {
      checkRequested = true;
      return route.fulfill({ status: 202 });
    }
    if (path === `/api/v1/tracked-products/${product.id}/history`) {
      return fulfillJson(route, pageOf(snapshots));
    }
    if (path === `/api/v1/tracked-products/${product.id}/verifications`) {
      return fulfillJson(route, pageOf([verification]));
    }
    if (path === `/api/v1/tracked-products/${product.id}/alerts`) {
      return fulfillJson(route, pageOf([alert]));
    }
    if (path === `/api/v1/tracked-products/${product.id}`) {
      return fulfillJson(route, product);
    }
    return fulfillJson(route, pageOf([]));
  });

  await page.goto("/products/new");
  await page.getByLabel("Identificador externo").fill(product.externalId);
  await page.getByLabel("URL da oferta").fill(product.sourceUrl);
  await page.getByLabel("Título do produto").fill(product.title);
  await page.getByLabel("Marca").fill(product.brand);
  await page.getByLabel("Modelo").fill(product.model);
  await page.getByLabel("Cor").fill(product.color);
  await page.getByLabel("Armazenamento / variante").fill(product.storage);
  await page.getByLabel("Preço desejado").fill("3.500,00");
  await page.getByRole("button", { name: "Começar monitoramento" }).click();

  await expect
    .poll(() => createRequested, { message: "criação não foi enviada" })
    .toBe(true);
  await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`));
  await expect(
    page.getByRole("heading", { name: product.title }),
  ).toBeVisible();
  await expect(page.getByText("Evolução do preço")).toBeVisible();

  await page.getByRole("button", { name: "Verificar agora" }).click();
  await expect
    .poll(() => checkRequested, { message: "check-now não foi chamado" })
    .toBe(true);
  await expect(page.getByText(/Consulta solicitada/)).toBeVisible();
});

test("exibe um alerta confirmado e a área administrativa", async ({
  page,
  context,
}) => {
  await authenticate(context);
  await mockSession(page, adminSession);
  await page.route("**/api/bff/**", async (route) => {
    const path = apiPath(route);

    if (path === `/api/v1/alerts/${alert.id}`) {
      return fulfillJson(route, alert);
    }
    if (path === `/api/v1/tracked-products/${product.id}/history`) {
      return fulfillJson(route, pageOf(snapshots));
    }
    if (path === `/api/v1/tracked-products/${product.id}/verifications`) {
      return fulfillJson(route, pageOf([verification]));
    }
    if (path === `/api/v1/tracked-products/${product.id}`) {
      return fulfillJson(route, product);
    }
    if (path === "/api/v1/dev/mock-offers") {
      return fulfillJson(route, [
        {
          id: "offer-1",
          externalId: product.externalId,
          title: product.title,
          price: 3499,
          regularPrice: 3999,
          currency: "BRL",
          paymentType: "PIX",
          sellerId: "SELLER-DEMO",
          sellerName: "Loja Demonstração",
          condition: "NEW",
          color: "Preto",
          storage: "512GB",
          inStock: true,
          availableQuantity: 5,
          couponRequired: false,
          sourceUrl: product.sourceUrl,
          updatedAt: "2026-06-06T12:15:00Z",
        },
      ]);
    }
    if (path === "/api/v1/admin/notifications/outbox") {
      return fulfillJson(
        route,
        pageOf([
          {
            id: "outbox-1",
            alertId: alert.id,
            channel: "EMAIL",
            recipient: "cliente@example.com",
            status: "SENT",
            attempts: 1,
            createdAt: "2026-06-06T12:15:00Z",
            sentAt: "2026-06-06T12:16:00Z",
          },
        ]),
      );
    }
    if (path === "/api/v1/tracked-products") {
      return fulfillJson(route, pageOf([product]));
    }
    return fulfillJson(route, pageOf([]));
  });

  await page.goto(`/alerts/${alert.id}`);
  await expect(
    page.getByRole("heading", { name: product.title }),
  ).toBeVisible();
  await expect(page.getByText("Critérios avaliados")).toBeVisible();
  await expect(page.getByText("Produto e variante correspondem")).toBeVisible();

  await page.goto("/admin/demo");
  await expect(
    page.getByRole("heading", { name: "Demonstração técnica" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar oferta MOCK" }),
  ).toBeVisible();
  await expect(page.getByText("cl***@example.com")).toBeVisible();
});

test("impede usuário comum de acessar a administração", async ({
  page,
  context,
}) => {
  await authenticate(context);
  await mockSession(page);
  await page.route("**/api/bff/**", (route) => fulfillJson(route, pageOf([])));

  await page.goto("/admin/demo");

  await expect(
    page.getByRole("heading", {
      name: "Acesso administrativo necessário",
    }),
  ).toBeVisible();
});
