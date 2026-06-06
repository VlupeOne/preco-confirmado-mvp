"use client";

import { browserApi } from "@/lib/api/browser-client";
import { requireData } from "@/lib/api/result";

export type AlertFilters = {
  page?: number;
  size?: number;
  status?:
    | "CREATED"
    | "NOTIFICATION_PENDING"
    | "NOTIFIED"
    | "NOTIFICATION_FAILED"
    | "EXPIRED";
  productId?: string;
  read?: boolean;
};

export async function listAlerts(filters: AlertFilters = {}) {
  return requireData(
    await browserApi.GET("/api/v1/alerts", {
      params: {
        query: {
          status: filters.status,
          productId: filters.productId,
          read: filters.read,
          pageable: {
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sort: ["createdAt,desc"],
          },
        },
      },
    }),
  );
}

export async function getAlert(id: string) {
  return requireData(
    await browserApi.GET("/api/v1/alerts/{id}", {
      params: { path: { id } },
    }),
  );
}

export async function markAlertRead(id: string) {
  return requireData(
    await browserApi.PATCH("/api/v1/alerts/{id}/read", {
      params: { path: { id } },
    }),
  );
}
