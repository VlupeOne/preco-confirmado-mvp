"use client";

import { browserApi } from "@/lib/api/browser-client";
import { requireData, requireSuccess } from "@/lib/api/result";
import type { ProductInput } from "@/lib/api/types";

export type ProductFilters = {
  page?: number;
  size?: number;
  status?: "ACTIVE" | "PAUSED" | "ERROR" | "DELETED";
  provider?: string;
  sort?: string[];
};

export async function listProducts(filters: ProductFilters = {}) {
  const result = await browserApi.GET("/api/v1/tracked-products", {
    params: {
      query: {
        status: filters.status,
        provider: filters.provider,
        pageable: {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
          sort: filters.sort ?? ["createdAt,desc"],
        },
      },
    },
  });
  return requireData(result);
}

export async function getProduct(id: string) {
  return requireData(
    await browserApi.GET("/api/v1/tracked-products/{id}", {
      params: { path: { id } },
    }),
  );
}

export async function createProduct(payload: ProductInput) {
  return requireData(
    await browserApi.POST("/api/v1/tracked-products", { body: payload }),
  );
}

export async function updateProduct({
  id,
  payload,
}: {
  id: string;
  payload: ProductInput;
}) {
  return requireData(
    await browserApi.PUT("/api/v1/tracked-products/{id}", {
      params: { path: { id } },
      body: payload,
    }),
  );
}

export async function removeProduct(id: string) {
  requireSuccess(
    await browserApi.DELETE("/api/v1/tracked-products/{id}", {
      params: { path: { id } },
    }),
  );
}

export async function pauseProduct(id: string) {
  return requireData(
    await browserApi.POST("/api/v1/tracked-products/{id}/pause", {
      params: { path: { id } },
    }),
  );
}

export async function resumeProduct(id: string) {
  return requireData(
    await browserApi.POST("/api/v1/tracked-products/{id}/resume", {
      params: { path: { id } },
    }),
  );
}

export async function checkProductNow(id: string) {
  requireSuccess(
    await browserApi.POST("/api/v1/tracked-products/{id}/check-now", {
      params: { path: { id } },
    }),
  );
}

export async function getProductHistory(id: string, size = 100) {
  return requireData(
    await browserApi.GET("/api/v1/tracked-products/{id}/history", {
      params: {
        path: { id },
        query: { pageable: { page: 0, size, sort: ["observedAt,asc"] } },
      },
    }),
  );
}

export async function getProductVerifications(id: string, size = 20) {
  return requireData(
    await browserApi.GET("/api/v1/tracked-products/{id}/verifications", {
      params: {
        path: { id },
        query: { pageable: { page: 0, size, sort: ["createdAt,desc"] } },
      },
    }),
  );
}

export async function getProductAlerts(id: string, size = 20) {
  return requireData(
    await browserApi.GET("/api/v1/tracked-products/{id}/alerts", {
      params: {
        path: { id },
        query: { pageable: { page: 0, size, sort: ["createdAt,desc"] } },
      },
    }),
  );
}
