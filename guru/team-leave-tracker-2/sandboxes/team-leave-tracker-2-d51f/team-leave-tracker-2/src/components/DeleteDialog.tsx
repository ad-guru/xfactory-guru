"use client";
import { useState } from "react";
import { rangeLabel } from "@/lib/leave/dates";
import type { LeaveEntry } from "@/lib/leave/schema";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

type Props = {
  entry: LeaveEntry | null;
  onClose: () => void;
  onConfirm: (e: LeaveEntry) => Promise<void>;
};

export default function DeleteDialog({ entry, onClose, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (!entry) return;
    setBusy(true);
    setError("");
    try {
      await onConfirm(entry);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!entry}
      onOpenChange={(o) => !o && onClose()}
      title="Delete leave entry?"
      description={entry ? `${entry.name} · ${rangeLabel(entry.startDate, entry.endDate)}` : undefined}
    >
      <p className="text-ink-muted">This removes the entry for everyone. It cannot be undone.</p>
      {error && <p role="alert" className="text-[12px] text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={confirm} disabled={busy}>{busy ? "Deleting…" : "Delete"}</Button>
      </div>
    </Modal>
  );
}
