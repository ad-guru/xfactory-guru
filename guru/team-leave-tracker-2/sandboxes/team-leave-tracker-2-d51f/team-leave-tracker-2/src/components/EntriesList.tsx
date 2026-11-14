"use client";
import { useState } from "react";
import clsx from "clsx";
import type { LeaveEntry } from "@/lib/leave/schema";
import { Card, CardHeader } from "./ui/Card";
import EntryRow from "./EntryRow";

type Props = {
  entries: LeaveEntry[];
  today: string;
  onEdit: (e: LeaveEntry) => void;
  onDelete: (e: LeaveEntry) => void;
};

const RECENT_LIMIT = 25;

export default function EntriesList({ entries, today, onEdit, onDelete }: Props) {
  const [tab, setTab] = useState<"upcoming" | "recent">("upcoming");
  const upcoming = entries
    .filter((e) => e.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name));
  const recent = entries
    .filter((e) => e.endDate < today)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
    .slice(0, RECENT_LIMIT);
  const rows = tab === "upcoming" ? upcoming : recent;

  const tabBtn = (key: typeof tab, label: string, count: number) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === key}
      onClick={() => setTab(key)}
      className={clsx(
        "h-7 px-3 rounded-md text-[12px] font-medium cursor-pointer",
        tab === key ? "bg-primary-soft text-primary" : "text-ink-muted hover:bg-surface-muted",
      )}
    >
      {label} <span className="font-mono">{count}</span>
    </button>
  );

  return (
    <Card aria-label="My leave">
      <CardHeader
        title="My leave"
        subtitle="Edit or delete any leave entry"
        actions={<div role="tablist" className="flex gap-1">{tabBtn("upcoming", "Upcoming & current", upcoming.length)}{tabBtn("recent", "Recent", recent.length)}</div>}
      />
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-ink-muted">
          {tab === "upcoming" ? "No upcoming leave. Log some with the form." : "No past leave entries yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-muted text-[12px] text-ink-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Dates</th>
                <th className="px-4 py-2 font-medium">Days</th>
                <th className="px-4 py-2 font-medium">Reason / note</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <EntryRow key={e.id} entry={e} onEdit={() => onEdit(e)} onDelete={() => onDelete(e)}
                  status={e.endDate < today ? "past" : e.startDate <= today ? "now" : "upcoming"} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
