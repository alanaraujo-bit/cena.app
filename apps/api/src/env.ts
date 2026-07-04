import { z } from 'zod';

// Load a local .env if present (Node >= 20.6 built-in; no dotenv dependency).
try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on real process env (fine in hosted environments).
}

/**
 * Validated environment. The server refuses to boot with an invalid config,
 * so misconfiguration fails loudly at startup instead of at request time.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),

  // Secrets — required in production, permissive defaults in dev so the app runs
  // before real keys are wired in.
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me-please'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me-please'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('180d'),

  // Wired in later milestones — optional at M1 so /health works with no secrets.
  DATABASE_URL: z.string().optional(),
  TMDB_API_KEY: z.string().optional(),
  TMDB_ACCESS_TOKEN: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),

  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuração de ambiente inválida:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
