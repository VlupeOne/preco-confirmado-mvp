import { readAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { backendRequest } from "@/lib/api/server-client";

export async function POST() {
  const { accessToken, refreshToken } = await readAuthCookies();
  try {
    if (accessToken && refreshToken) {
      await backendRequest(
        "/api/v1/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
        accessToken,
      );
    }
  } finally {
    await clearAuthCookies();
  }

  return new Response(null, { status: 204 });
}
