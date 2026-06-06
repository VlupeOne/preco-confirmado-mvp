import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  BACKEND_URL: z.url().default("http://localhost:8080"),
  AUTH_ACCESS_COOKIE_NAME: z.string().min(1).default("pc_access_token"),
  AUTH_REFRESH_COOKIE_NAME: z.string().min(1).default("pc_refresh_token"),
  AUTH_ACCESS_COOKIE_MAX_AGE: z.coerce.number().int().positive().default(900),
  AUTH_REFRESH_COOKIE_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(604800),
  AUTH_COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(process.env.NODE_ENV === "production"),
  BFF_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  BFF_MAX_BODY_BYTES: z.coerce.number().int().positive().default(1048576),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}
