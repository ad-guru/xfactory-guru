import { db, ensureTables, votesTable } from "../db";
import { loadRestaurants } from "./restaurants";
import type { PollState } from "./types";

/** Totals are always computed from the stored votes. */
export async function getPollState(voterToken: string | null): Promise<PollState> {
  await ensureTables();
  const sql = db();
  const restaurants = await loadRestaurants();
  const rows = await sql<{ restaurant_id: string; votes: number }[]>`
    SELECT restaurant_id, count(*)::int AS votes
    FROM ${sql(votesTable())} GROUP BY restaurant_id`;
  const counts = new Map(rows.map((r) => [r.restaurant_id, r.votes]));

  let myVote: string | null = null;
  if (voterToken) {
    const mine = await sql<{ restaurant_id: string }[]>`
      SELECT restaurant_id FROM ${sql(votesTable())} WHERE voter_token = ${voterToken}`;
    myVote = mine[0]?.restaurant_id ?? null;
  }

  const tallies = restaurants.map((r) => ({ ...r, votes: counts.get(r.id) ?? 0 }));
  return {
    restaurants: tallies,
    total: tallies.reduce((sum, t) => sum + t.votes, 0),
    myVote: tallies.some((t) => t.id === myVote) ? myVote : null,
    updatedAt: new Date().toISOString(),
  };
}

/** One row per browser token: voting again changes the vote, never adds one. */
export async function castVote(voterToken: string, restaurantId: string): Promise<void> {
  const restaurants = await loadRestaurants();
  if (!restaurants.some((r) => r.id === restaurantId)) throw new Error("Unknown restaurant");
  await ensureTables();
  const sql = db();
  await sql`
    INSERT INTO ${sql(votesTable())} (voter_token, restaurant_id)
    VALUES (${voterToken}, ${restaurantId})
    ON CONFLICT (voter_token)
    DO UPDATE SET restaurant_id = EXCLUDED.restaurant_id, updated_at = now()`;
}
