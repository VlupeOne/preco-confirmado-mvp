import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const schemaPath = new URL(
  "../src/lib/api/generated/schema.d.ts",
  import.meta.url,
);
const before = await readFile(schemaPath, "utf8");
const cli = fileURLToPath(
  new URL("../node_modules/openapi-typescript/bin/cli.js", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [
    cli,
    "openapi/preco-confirmado.openapi.json",
    "-o",
    "src/lib/api/generated/schema.d.ts",
  ],
  {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    encoding: "utf8",
    stdio: "inherit",
  },
);

if (result.status !== 0) {
  if (result.error) console.error(result.error);
  process.exit(result.status ?? 1);
}

const after = await readFile(schemaPath, "utf8");
if (before !== after) {
  console.error(
    "O schema TypeScript estava dessincronizado. Execute npm run api:generate e versione o resultado.",
  );
  process.exit(1);
}

console.log("OpenAPI local e tipos gerados estão sincronizados.");
