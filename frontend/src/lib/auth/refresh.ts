import "server-only";

import type { AuthTokens } from "@/lib/api/types";
import { backendRequest } from "@/lib/api/server-client";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

const refreshFlights = new Map<string, Promise<AuthTokens>>();

async function requestRefresh(refreshToken: string): Promise<AuthTokens> {
  const response = await backendRequest("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error("Refresh inválido.");
  return (await response.json()) as AuthTokens;
}

export async function refreshSession(refreshToken: string) {
  let flight = refreshFlights.get(refreshToken);
  if (!flight) {
    flight = requestRefresh(refreshToken);
    refreshFlights.set(refreshToken, flight);
  }

  try {
    const tokens = await flight;
    await setAuthCookies(tokens);
    return tokens;
  } catch (error) {
    await clearAuthCookies();
    throw error;
  } finally {
    if (refreshFlights.get(refreshToken) === flight) {
      refreshFlights.delete(refreshToken);
    }
  }
}

export function activeRefreshFlights() {
  return refreshFlights.size;
}
