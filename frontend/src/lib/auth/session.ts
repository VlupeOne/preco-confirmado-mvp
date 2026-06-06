import "server-only";

import type { SessionUser } from "@/lib/api/types";
import { backendRequest } from "@/lib/api/server-client";
import { clearAuthCookies, readAuthCookies } from "@/lib/auth/cookies";
import { refreshSession } from "@/lib/auth/refresh";

async function requestUser(accessToken: string) {
  return backendRequest("/api/v1/users/me", {}, accessToken);
}

export async function loadSession(): Promise<SessionUser | null> {
  const { accessToken, refreshToken } = await readAuthCookies();
  if (!accessToken && !refreshToken) return null;

  let response = accessToken ? await requestUser(accessToken) : undefined;
  if ((!response || response.status === 401) && refreshToken) {
    try {
      const tokens = await refreshSession(refreshToken);
      response = await requestUser(tokens.accessToken ?? "");
    } catch {
      await clearAuthCookies();
      return null;
    }
  }

  if (!response?.ok) {
    if (response?.status === 401) await clearAuthCookies();
    return null;
  }

  return (await response.json()) as SessionUser;
}
