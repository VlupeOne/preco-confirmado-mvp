import { NextResponse } from "next/server";

import { readAuthCookies } from "@/lib/auth/cookies";
import { refreshSession } from "@/lib/auth/refresh";

export async function POST() {
  const { refreshToken } = await readAuthCookies();
  if (!refreshToken) {
    return NextResponse.json({ detail: "Sessão ausente." }, { status: 401 });
  }

  try {
    await refreshSession(refreshToken);
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
  }
}
