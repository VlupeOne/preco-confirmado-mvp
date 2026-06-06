import { NextRequest } from "next/server";

import { validateBffPath } from "@/lib/api/allowed-paths";
import { backendRequest } from "@/lib/api/server-client";
import { readAuthCookies } from "@/lib/auth/cookies";
import { refreshSession } from "@/lib/auth/refresh";
import { getServerEnv } from "@/lib/env/server";
import { publicEnv } from "@/lib/env/public";

const supportedMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function validateOrigin(request: NextRequest) {
  if (!mutatingMethods.has(request.method)) return;
  const expected = new URL(publicEnv.NEXT_PUBLIC_APP_URL);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || origin !== expected.origin || host !== expected.host) {
    throw new Error("Origem não permitida.");
  }
}

async function readBody(request: NextRequest) {
  if (!mutatingMethods.has(request.method)) return undefined;
  const limit = getServerEnv().BFF_MAX_BODY_BYTES;
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > limit) throw new Error("Corpo da requisição excede o limite.");
  const body = await request.arrayBuffer();
  if (body.byteLength > limit)
    throw new Error("Corpo da requisição excede o limite.");
  return body.byteLength ? body : undefined;
}

function forwardedHeaders(request: NextRequest, accessToken: string) {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  headers.set(
    "X-Correlation-ID",
    request.headers.get("x-correlation-id") ?? crypto.randomUUID(),
  );
  headers.set("Authorization", `Bearer ${accessToken}`);
  return headers;
}

async function proxyRequest(
  request: NextRequest,
  path: string,
  body: ArrayBuffer | undefined,
  accessToken: string,
) {
  return backendRequest(`${path}${request.nextUrl.search}`, {
    method: request.method,
    headers: forwardedHeaders(request, accessToken),
    body,
  });
}

async function handler(request: NextRequest) {
  if (!supportedMethods.has(request.method)) {
    return Response.json({ detail: "Método não permitido." }, { status: 405 });
  }

  try {
    validateOrigin(request);
    const rawPath = request.nextUrl.pathname.slice("/api/bff".length);
    const path = validateBffPath(rawPath);
    const body = await readBody(request);
    const auth = await readAuthCookies();
    let accessToken = auth.accessToken;

    if (!accessToken && auth.refreshToken) {
      accessToken = (await refreshSession(auth.refreshToken)).accessToken;
    }
    if (!accessToken) {
      return Response.json({ detail: "Sessão ausente." }, { status: 401 });
    }

    let response = await proxyRequest(request, path, body, accessToken);
    if (response.status === 401 && auth.refreshToken) {
      const tokens = await refreshSession(auth.refreshToken);
      response = await proxyRequest(
        request,
        path,
        body,
        tokens.accessToken ?? "",
      );
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const correlationId = response.headers.get("x-correlation-id");
    if (contentType) headers.set("Content-Type", contentType);
    if (correlationId) headers.set("X-Correlation-ID", correlationId);

    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Requisição inválida.";
    const status = message.includes("Sessão") ? 401 : 400;
    return Response.json(
      { title: "Requisição bloqueada", detail: message },
      { status },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
