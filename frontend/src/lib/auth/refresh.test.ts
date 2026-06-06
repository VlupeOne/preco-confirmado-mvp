import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/server-client", () => ({
  backendRequest: mocks.backendRequest,
}));
vi.mock("@/lib/auth/cookies", () => ({
  setAuthCookies: mocks.setAuthCookies,
  clearAuthCookies: mocks.clearAuthCookies,
}));

describe("refreshSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("limita refresh concorrente a uma chamada por token", async () => {
    mocks.backendRequest.mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: "new-access",
          refreshToken: "new-refresh",
          expiresIn: 900,
          tokenType: "Bearer",
        }),
        { status: 200 },
      ),
    );
    const { refreshSession } = await import("@/lib/auth/refresh");
    await Promise.all([
      refreshSession("same-token"),
      refreshSession("same-token"),
    ]);

    expect(mocks.backendRequest).toHaveBeenCalledTimes(1);
    expect(mocks.setAuthCookies).toHaveBeenCalledTimes(2);
  });

  it("limpa cookies quando o refresh é inválido", async () => {
    mocks.backendRequest.mockResolvedValue(new Response(null, { status: 401 }));
    const { refreshSession } = await import("@/lib/auth/refresh");

    await expect(refreshSession("invalid-token")).rejects.toThrow();
    expect(mocks.clearAuthCookies).toHaveBeenCalledOnce();
  });
});
