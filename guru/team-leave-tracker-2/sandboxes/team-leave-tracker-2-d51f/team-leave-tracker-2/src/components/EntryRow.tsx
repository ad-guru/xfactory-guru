"use client";
import { Pencil, Trash2 } from "lucide-react";
import { dayCount, rangeLabel } from "@/lib/leave/dates";
import type { LeaveEntry } from "@/lib/leave/schema";
import { Button } from "./ui/Button";
import { LeaveBadge } from "./ui/LeaveBadge";

type Props = {
  entry: LeaveEntry;
  status: "past" | "now" | "upcoming";
  onEdit: () => void;
  onDelete: () => void;
};

export default function EntryRow({ entry, status, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted">
      <td className="px-4 py-2 font-medium">{entry.name}</td>
      <td className="px-4 py-2 font-mono text-[13px] whitespace-nowrap">{rangeLabel(entry.startDate, entry.endDate)}</td>
      <td className="px-4 py-2 font-mono text-[13px]">{dayCount(entry.startDate, entry.endDate)}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {entry.leaveType ? <LeaveBadge type={entry.leaveType} /> : <span className="text-ink-faint">—</span>}
          {status === "now" && <span className="text-[12px] text-success font-medium">Out now</span>}
        </div>
      </td>
      <td className="px-4 py-2">
        {entry.note
          ? <span className="block text-[12px] text-ink-muted truncate max-w-[220px]" title={entry.note}>{entry.note}</span>
          : <span className="text-ink-faint">—</span>}
      </td>
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit leave for ${entry.name}`}>
          <Pencil className="size-3.5" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete leave for ${entry.name}`} className="text-error">
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </td>
    </tr>
  );
}
