"use client";

import { browserApi } from "@/lib/api/browser-client";
import { requireData, requireSuccess } from "@/lib/api/result";
import type { MockOfferInput } from "@/lib/api/types";

export async function listMockOffers() {
  return requireData(await browserApi.GET("/api/v1/dev/mock-offers"));
}

export async function createMockOffer(payload: MockOfferInput) {
  return requireData(
    await browserApi.POST("/api/v1/dev/mock-offers", { body: payload }),
  );
}

export async function updateMockOffer({
  externalId,
  payload,
}: {
  externalId: string;
  payload: MockOfferInput;
}) {
  return requireData(
    await browserApi.PUT("/api/v1/dev/mock-offers/{externalId}", {
      params: { path: { externalId } },
      body: payload,
    }),
  );
}

export async function removeMockOffer(externalId: string) {
  requireSuccess(
    await browserApi.DELETE("/api/v1/dev/mock-offers/{externalId}", {
      params: { path: { externalId } },
    }),
  );
}

export async function runMonitoring() {
  return requireData(await browserApi.POST("/api/v1/admin/monitoring/run"));
}

export async function runRechecks() {
  return requireData(
    await browserApi.POST("/api/v1/admin/monitoring/recheck-pending"),
  );
}

export async function dispatchNotifications() {
  return requireData(
    await browserApi.POST("/api/v1/admin/notifications/dispatch"),
  );
}

export async function listOutbox(
  status?: "PENDING" | "PROCESSING" | "SENT" | "FAILED" | "DEAD",
) {
  return requireData(
    await browserApi.GET("/api/v1/admin/notifications/outbox", {
      params: {
        query: {
          status,
          pageable: { page: 0, size: 20, sort: ["createdAt,desc"] },
        },
      },
    }),
  );
}
