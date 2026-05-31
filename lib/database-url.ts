const DATABASE_ENV_KEYS = [
  "DATABASE_URL",
  "DATABASE_PRISMA_DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
] as const;

/** Resolve and normalize the database URL from Vercel/Prisma Postgres env vars. */
export function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const fallback =
    process.env.DATABASE_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (fallback) {
    process.env.DATABASE_URL = fallback;
    return fallback;
  }

  return undefined;
}

export function getConfiguredDatabaseEnvKeys(): string[] {
  return DATABASE_ENV_KEYS.filter((key) => Boolean(process.env[key]));
}
