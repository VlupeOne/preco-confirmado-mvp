import { NextResponse } from "next/server";

import type { AuthTokens } from "@/lib/api/types";
import { backendRequest } from "@/lib/api/server-client";
import { parseProblemDetail } from "@/lib/api/problem-details";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/auth/schemas";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { title: "Dados inválidos", detail: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
  };
  const response = await backendRequest("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => undefined);
  if (!response.ok) {
    return NextResponse.json(parseProblemDetail(body, response.status), {
      status: response.status,
    });
  }

  await setAuthCookies(body as AuthTokens);
  return NextResponse.json({ authenticated: true }, { status: 201 });
}
