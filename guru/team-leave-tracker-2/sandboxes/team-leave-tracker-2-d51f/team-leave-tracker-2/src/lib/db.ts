import postgres from "postgres";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const g = globalThis as unknown as { __pg?: ReturnType<typeof postgres> };

// Lazy: `next build` imports this with no env, so read nothing at load.
export function db() {
  g.__pg ??= postgres(requireEnv("DATABASE_URL"), {
    connection: { search_path: requireEnv("XFACTORY_PG_SCHEMA") },
    max: 5,
  });
  return g.__pg;
}

export const table = (name: string) =>
  (process.env.XFACTORY_SANDBOX_TABLE_PREFIX ?? "") + name;
