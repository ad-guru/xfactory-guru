import { listEntries } from "@/lib/leave/queries";
import type { LeaveEntry } from "@/lib/leave/schema";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  let entries: LeaveEntry[] | null = null;
  try {
    entries = await listEntries();
  } catch (e) {
    console.error("load entries failed", e);
  }
  return (
    <main className="mx-auto max-w-[1280px] px-6 py-5 flex flex-col gap-4">
      <div>
        <h1 className="text-[18px] leading-7 font-semibold">Team leave</h1>
        <p className="text-ink-muted">Log your days off and see at a glance who is out this week.</p>
      </div>
      {entries ? (
        <Dashboard initial={entries} />
      ) : (
        <p role="alert" className="bg-error-soft text-error rounded-md px-4 py-3">
          Leave entries could not be loaded from the database. Try reloading the page.
        </p>
      )}
    </main>
  );
}
