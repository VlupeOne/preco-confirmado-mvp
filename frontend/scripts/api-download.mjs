import { mkdir, writeFile } from "node:fs/promises";

const url =
  process.env.BACKEND_OPENAPI_URL ?? "http://localhost:8080/v3/api-docs";
const output = new URL(
  "../openapi/preco-confirmado.openapi.json",
  import.meta.url,
);

const response = await fetch(url, {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(15_000),
});

if (!response.ok) {
  throw new Error(`Falha ao baixar OpenAPI: HTTP ${response.status}`);
}

const body = await response.text();
JSON.parse(body);
await mkdir(new URL("../openapi/", import.meta.url), { recursive: true });
await writeFile(output, `${body.trim()}\n`, "utf8");
console.log(`OpenAPI atualizado a partir de ${url}`);
