import { isAllowedBffPath, validateBffPath } from "@/lib/api/allowed-paths";

describe("BFF allowlist", () => {
  it("aceita grupos e subcaminhos conhecidos", () => {
    expect(isAllowedBffPath("/api/v1/tracked-products/abc/history")).toBe(true);
    expect(isAllowedBffPath("/api/v1/admin/notifications/outbox")).toBe(true);
  });

  it.each([
    "https://evil.example/api",
    "//evil.example/api",
    "/api/v1/tracked-products/../admin",
    "/api/v1/tracked-products/%2e%2e/admin",
    "/api/v1/tracked-products/%2Fadmin",
    "/api/v1/tracked-products\\admin",
    "/actuator/health",
  ])("rejeita caminho perigoso: %s", (path) => {
    expect(() => validateBffPath(path)).toThrow();
  });
});
