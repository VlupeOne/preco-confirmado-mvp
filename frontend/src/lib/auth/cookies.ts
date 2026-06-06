import "server-only";

import { cookies } from "next/headers";

import type { AuthTokens } from "@/lib/api/types";
import { getServerEnv } from "@/lib/env/server";

export async function readAuthCookies() {
  const env = getServerEnv();
  const store = await cookies();
  return {
    accessToken: store.get(env.AUTH_ACCESS_COOKIE_NAME)?.value,
    refreshToken: store.get(env.AUTH_REFRESH_COOKIE_NAME)?.value,
  };
}

export async function setAuthCookies(tokens: AuthTokens) {
  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error("O backend não retornou tokens válidos.");
  }

  const env = getServerEnv();
  const store = await cookies();
  const base = {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
  };

  store.set(env.AUTH_ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...base,
    maxAge: Math.min(
      tokens.expiresIn ?? env.AUTH_ACCESS_COOKIE_MAX_AGE,
      env.AUTH_ACCESS_COOKIE_MAX_AGE,
    ),
  });
  store.set(env.AUTH_REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...base,
    maxAge: env.AUTH_REFRESH_COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookies() {
  const env = getServerEnv();
  const store = await cookies();
  store.set(env.AUTH_ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  store.set(env.AUTH_REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
