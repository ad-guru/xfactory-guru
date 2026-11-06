import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { Restaurant } from "./types";

const schema = z
  .array(z.object({ id: z.string().min(1), name: z.string().min(1), tagline: z.string().default("") }))
  .min(1);

/**
 * Restaurants are config, not code: RESTAURANTS_JSON env wins,
 * otherwise config/restaurants.json is read at request time.
 */
export async function loadRestaurants(): Promise<Restaurant[]> {
  const fromEnv = process.env.RESTAURANTS_JSON;
  const raw = fromEnv
    ? fromEnv
    : await readFile(path.join(process.cwd(), "config", "restaurants.json"), "utf8");
  return schema.parse(JSON.parse(raw));
}
