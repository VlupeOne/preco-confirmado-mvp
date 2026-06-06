import { NextResponse } from "next/server";

import { loadSession } from "@/lib/auth/session";

export async function GET() {
  const user = await loadSession();
  if (!user) {
    return NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
  }
  return NextResponse.json({ user });
}
