"use client";

import type { SessionUser } from "@/lib/api/types";
import { apiErrorFromResponse } from "@/lib/api/problem-details";

export async function login(payload: { email: string; password: string }) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
}

export async function getSession(): Promise<SessionUser> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) throw await apiErrorFromResponse(response);
  const body = (await response.json()) as { user: SessionUser };
  return body.user;
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}
