import * as z from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(3001),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),
    CORS_ORIGINS: z
      .string()
      .default("http://localhost:5173")
      .transform((s) =>
        s
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      ),
  })
  .transform((e) => ({
    nodeEnv: e.NODE_ENV,
    isDev: e.NODE_ENV === "development",
    logLevel: e.LOG_LEVEL ?? (e.NODE_ENV === "development" ? "debug" : "info"),
    server: {
      host: e.HOST,
      port: e.PORT,
      corsOrigins: e.CORS_ORIGINS,
    },
  }));

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error("❌ Invalid environment variables");
  console.error(z.treeifyError(error));
  process.exit(1);
}

export const env = data;
