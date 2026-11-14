"use client";
import { useMemo, useState } from "react";
import { api } from "@/lib/leave/client";
import { todayIso } from "@/lib/leave/dates";
import type { EntryInput, LeaveEntry } from "@/lib/leave/schema";
import { Card, CardHeader } from "./ui/Card";
import { Modal } from "./ui/Modal";
import LeaveForm from "./LeaveForm";
import WhosOff from "./WhosOff";
import EntriesList from "./EntriesList";
import DeleteDialog from "./DeleteDialog";

export default function Dashboard({ initial }: { initial: LeaveEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [editing, setEditing] = useState<LeaveEntry | null>(null);
  const [deleting, setDeleting] = useState<LeaveEntry | null>(null);
  const [today] = useState(todayIso);
  const names = useMemo(
    () => [...new Set(entries.map((e) => e.name))].sort((a, b) => a.localeCompare(b)),
    [entries],
  );

  async function create(input: EntryInput) {
    const entry = await api.create(input);
    setEntries((list) => [entry, ...list]);
  }
  async function update(input: EntryInput) {
    if (!editing) return;
    const entry = await api.update(editing.id, input);
    setEntries((list) => list.map((e) => (e.id === entry.id ? entry : e)));
    setEditing(null);
  }
  async function remove(target: LeaveEntry) {
    await api.remove(target.id);
    setEntries((list) => list.filter((e) => e.id !== target.id));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      <div className="flex flex-col gap-4 min-w-0">
        <WhosOff entries={entries} today={today} />
        <EntriesList entries={entries} today={today} onEdit={setEditing} onDelete={setDeleting} />
      </div>
      <Card aria-label="Log leave" className="lg:sticky lg:top-4">
        <CardHeader title="Log leave" subtitle="Whole days, start and end included" />
        <div className="p-4">
          <LeaveForm idPrefix="new" names={names} submitLabel="Add leave" onSubmit={create} />
        </div>
      </Card>
      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title="Edit leave entry">
        {editing && (
          <LeaveForm key={editing.id} idPrefix="edit" names={names} initial={editing}
            submitLabel="Save changes" onSubmit={update} onCancel={() => setEditing(null)} />
        )}
      </Modal>
      <DeleteDialog entry={deleting} onClose={() => setDeleting(null)} onConfirm={remove} />
    </div>
  );
}
