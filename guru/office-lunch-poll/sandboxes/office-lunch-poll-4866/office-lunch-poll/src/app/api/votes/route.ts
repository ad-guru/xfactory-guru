import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { castVote, getPollState } from "@/lib/poll/queries";

export const dynamic = "force-dynamic";

const token = z.string().uuid();
const body = z.object({ token, restaurantId: z.string().min(1).max(100) });

function fail(err: unknown, status = 500) {
  console.error("votes api:", err instanceof Error ? err.message : err);
  return NextResponse.json({ error: status === 400 ? "Invalid vote" : "Poll unavailable" }, { status });
}

export async function GET(req: NextRequest) {
  const parsed = token.safeParse(req.nextUrl.searchParams.get("token"));
  try {
    const state = await getPollState(parsed.success ? parsed.data : null);
    return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error, 400);
  try {
    await castVote(parsed.data.token, parsed.data.restaurantId);
    return NextResponse.json(await getPollState(parsed.data.token));
  } catch (err) {
    const unknown = err instanceof Error && err.message === "Unknown restaurant";
    return fail(err, unknown ? 400 : 500);
  }
}
