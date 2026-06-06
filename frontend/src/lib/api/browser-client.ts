"use client";

import createClient from "openapi-fetch";

import type { paths } from "@/lib/api/generated/schema";

function querySerializer(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;

    if (
      key === "pageable" &&
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      for (const [pageKey, pageValue] of Object.entries(value)) {
        if (Array.isArray(pageValue)) {
          pageValue.forEach((item) => params.append(pageKey, String(item)));
        } else if (pageValue !== undefined && pageValue !== null) {
          params.set(pageKey, String(pageValue));
        }
      }
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export const browserApi = createClient<paths>({
  baseUrl: "/api/bff",
  querySerializer,
});
