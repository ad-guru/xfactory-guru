import { NextResponse } from "next/server";
import { deleteEntry, updateEntry } from "@/lib/leave/queries";
import { entryInput, fieldErrors } from "@/lib/leave/schema";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const parsed = entryInput.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry", fields: fieldErrors(parsed.error) }, { status: 400 });
  }
  try {
    const entry = await updateEntry(id, parsed.data);
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ entry });
  } catch (e) {
    console.error("update entry failed", e);
    return NextResponse.json({ error: "Could not update the entry" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const ok = await deleteEntry(id);
    if (!ok) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete entry failed", e);
    return NextResponse.json({ error: "Could not delete the entry" }, { status: 500 });
  }
}
