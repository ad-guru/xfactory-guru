import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/leave/queries";
import { entryInput, fieldErrors } from "@/lib/leave/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ entries: await listEntries() });
  } catch (e) {
    console.error("list entries failed", e);
    return NextResponse.json({ error: "Could not load leave entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = entryInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  try {
    return NextResponse.json({ entry: await createEntry(parsed.data) }, { status: 201 });
  } catch (e) {
    console.error("create entry failed", e);
    return NextResponse.json({ error: "Could not save the entry" }, { status: 500 });
  }
}
