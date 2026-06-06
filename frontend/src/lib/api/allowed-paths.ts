const allowedPrefixes = [
  "/api/v1/users/me",
  "/api/v1/tracked-products",
  "/api/v1/alerts",
  "/api/v1/dev/mock-offers",
  "/api/v1/admin/monitoring",
  "/api/v1/admin/notifications",
] as const;

const dangerousEncoding = /%(?:00|25|2e|2f|5c)/i;

export function validateBffPath(rawPath: string): string {
  if (
    !rawPath.startsWith("/") ||
    rawPath.startsWith("//") ||
    rawPath.includes("://") ||
    rawPath.includes("\\") ||
    rawPath.includes("\0") ||
    dangerousEncoding.test(rawPath)
  ) {
    throw new Error("Caminho inválido.");
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    throw new Error("Codificação de caminho inválida.");
  }

  if (
    decoded.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    throw new Error("Path traversal bloqueado.");
  }

  const allowed = allowedPrefixes.some(
    (prefix) => decoded === prefix || decoded.startsWith(`${prefix}/`),
  );
  if (!allowed) throw new Error("Endpoint fora da allowlist.");

  return decoded;
}

export function isAllowedBffPath(path: string) {
  try {
    validateBffPath(path);
    return true;
  } catch {
    return false;
  }
}
