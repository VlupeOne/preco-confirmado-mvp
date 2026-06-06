import type { BrowserContext, Page, Route } from "@playwright/test";

const baseURL = "http://localhost:3000";

export const userSession = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Ana Silva",
  email: "ana@example.com",
  role: "USER",
  active: true,
};

export const adminSession = {
  ...userSession,
  id: "00000000-0000-0000-0000-000000000002",
  name: "Admin Aplicação",
  email: "admin@example.com",
  role: "ADMIN",
};

export const product = {
  id: "product-1",
  userId: userSession.id,
  providerCode: "MOCK",
  externalId: "DEMO-001",
  sourceUrl: "https://loja.example/produtos/demo-001",
  title: "Notebook Demo 16 GB 512 GB",
  brand: "Demo",
  model: "Pro",
  color: "Preto",
  storage: "512GB",
  condition: "NEW",
  targetPrice: 3500,
  currency: "BRL",
  status: "ACTIVE",
  checkIntervalMinutes: 30,
  nextCheckAt: "2026-06-06T15:30:00Z",
  createdAt: "2026-06-06T12:00:00Z",
  updatedAt: "2026-06-06T12:00:00Z",
  version: 0,
};

export const snapshots = [
  {
    id: "snapshot-1",
    providerCode: "MOCK",
    externalId: product.externalId,
    title: product.title,
    price: 3499,
    regularPrice: 3999,
    currency: "BRL",
    paymentType: "PIX",
    couponRequired: false,
    sellerId: "SELLER-DEMO",
    sellerName: "Loja Demonstração",
    condition: "NEW",
    color: "Preto",
    storage: "512GB",
    inStock: true,
    availableQuantity: 5,
    sourceUrl: product.sourceUrl,
    observedAt: "2026-06-06T12:10:00Z",
  },
  {
    id: "snapshot-2",
    providerCode: "MOCK",
    externalId: product.externalId,
    title: product.title,
    price: 3499,
    regularPrice: 3999,
    currency: "BRL",
    paymentType: "PIX",
    couponRequired: false,
    sellerId: "SELLER-DEMO",
    sellerName: "Loja Demonstração",
    condition: "NEW",
    color: "Preto",
    storage: "512GB",
    inStock: true,
    availableQuantity: 5,
    sourceUrl: product.sourceUrl,
    observedAt: "2026-06-06T12:15:00Z",
  },
];

export const verification = {
  id: "verification-1",
  firstSnapshotId: "snapshot-1",
  secondSnapshotId: "snapshot-2",
  status: "APPROVED",
  score: 100,
  confidence: "HIGH",
  reasons: JSON.stringify([
    "product_and_variant_match",
    "price_confirmed",
    "stock_confirmed",
    "seller_consistent",
    "payment_consistent",
    "coupon_consistent",
    "recheck_within_validity",
  ]),
  startedAt: "2026-06-06T12:10:00Z",
  completedAt: "2026-06-06T12:15:00Z",
  createdAt: "2026-06-06T12:10:00Z",
};

export const alert = {
  id: "alert-1",
  userId: userSession.id,
  trackedProductId: product.id,
  verificationAttemptId: verification.id,
  verifiedPrice: 3499,
  targetPrice: product.targetPrice,
  currency: "BRL",
  confidenceScore: 100,
  confidence: "HIGH",
  paymentType: "PIX",
  sellerId: "SELLER-DEMO",
  sourceUrl: product.sourceUrl,
  status: "NOTIFIED",
  createdAt: "2026-06-06T12:15:00Z",
};

export function pageOf<T>(content: T[]) {
  return {
    content,
    page: {
      size: Math.max(content.length, 1),
      number: 0,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
    },
  };
}

export async function authenticate(context: BrowserContext) {
  await context.addCookies([
    {
      name: "pc_access_token",
      value: "e2e-access-token",
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

export async function mockSession(
  page: Page,
  session: typeof userSession | typeof adminSession = userSession,
) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({ json: { user: session } });
  });
}

export function apiPath(route: Route) {
  return new URL(route.request().url()).pathname.replace("/api/bff", "");
}

export async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(json),
  });
}
