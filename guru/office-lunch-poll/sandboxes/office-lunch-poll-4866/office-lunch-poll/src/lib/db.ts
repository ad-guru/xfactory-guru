import postgres from "postgres";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __lunchSql?: Sql; __lunchReady?: Promise<void> };

/** Lazily created so `next build` never needs the database env. */
export function db(): Sql {
  if (!g.__lunchSql) {
    g.__lunchSql = postgres(requireEnv("DATABASE_URL"), {
      max: 5,
      connection: { search_path: requireEnv("AGENTRY_PG_SCHEMA") },
    });
  }
  return g.__lunchSql;
}

/** Sandbox tables carry the sandbox prefix; deploys use plain names. */
export function votesTable(): string {
  return `${process.env.AGENTRY_SANDBOX_TABLE_PREFIX ?? ""}lunch_votes`;
}

export function ensureTables(): Promise<void> {
  if (!g.__lunchReady) {
    const sql = db();
    g.__lunchReady = sql`
      CREATE TABLE IF NOT EXISTS ${sql(votesTable())} (
        voter_token TEXT PRIMARY KEY,
        restaurant_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`.then(() => undefined)
      .catch((err) => {
        g.__lunchReady = undefined;
        throw err;
      });
  }
  return g.__lunchReady;
}
