import { db, table } from "../db";
import type { EntryInput, LeaveEntry } from "./schema";

let ready: Promise<void> | undefined;

function ensureTables() {
  ready ??= (async () => {
    const sql = db();
    await sql`CREATE TABLE IF NOT EXISTS ${sql(table("leave_entries"))} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL CHECK (end_date >= start_date),
      leave_type TEXT,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  })().catch((e) => {
    ready = undefined;
    throw e;
  });
  return ready;
}

const columns = (sql: ReturnType<typeof db>) => sql`
  id::text AS id, name,
  to_char(start_date, 'YYYY-MM-DD') AS "startDate",
  to_char(end_date, 'YYYY-MM-DD') AS "endDate",
  leave_type AS "leaveType", note`;

export async function listEntries(): Promise<LeaveEntry[]> {
  await ensureTables();
  const sql = db();
  return sql<LeaveEntry[]>`SELECT ${columns(sql)} FROM ${sql(table("leave_entries"))}
    ORDER BY start_date DESC, name ASC`;
}

function values(input: EntryInput) {
  return {
    name: input.name.trim(),
    start_date: input.startDate,
    end_date: input.endDate,
    leave_type: input.leaveType ?? null,
    note: input.note ? input.note : null,
  };
}

export async function createEntry(input: EntryInput): Promise<LeaveEntry> {
  await ensureTables();
  const sql = db();
  const [row] = await sql<LeaveEntry[]>`INSERT INTO ${sql(table("leave_entries"))}
    ${sql(values(input))} RETURNING ${columns(sql)}`;
  return row;
}

export async function updateEntry(id: string, input: EntryInput): Promise<LeaveEntry | null> {
  await ensureTables();
  const sql = db();
  const [row] = await sql<LeaveEntry[]>`UPDATE ${sql(table("leave_entries"))}
    SET ${sql(values(input))}, updated_at = now()
    WHERE id::text = ${id} RETURNING ${columns(sql)}`;
  return row ?? null;
}

export async function deleteEntry(id: string): Promise<boolean> {
  await ensureTables();
  const sql = db();
  const res = await sql`DELETE FROM ${sql(table("leave_entries"))} WHERE id::text = ${id}`;
  return res.count > 0;
}
