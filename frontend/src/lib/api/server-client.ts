import "server-only";

import createClient from "openapi-fetch";

import type { paths } from "@/lib/api/generated/schema";
import { getServerEnv } from "@/lib/env/server";

export function createServerApi(accessToken: string) {
  return createClient<paths>({
    baseUrl: getServerEnv().BACKEND_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

export async function backendRequest(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  return fetch(`${getServerEnv().BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(getServerEnv().BFF_REQUEST_TIMEOUT_MS),
  });
}
