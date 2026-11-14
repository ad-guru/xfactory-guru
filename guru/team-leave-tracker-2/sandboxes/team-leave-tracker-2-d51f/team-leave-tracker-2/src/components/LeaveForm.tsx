"use client";
import { useState } from "react";
import { entryInput, fieldErrors, LEAVE_TYPES } from "@/lib/leave/schema";
import type { EntryInput, FieldErrors, LeaveType } from "@/lib/leave/schema";
import { ApiError } from "@/lib/leave/client";
import { Button } from "./ui/Button";
import { Field, Input, inputClass } from "./ui/Input";
import NameCombobox from "./NameCombobox";

type Props = {
  idPrefix: string;
  names: string[];
  initial?: EntryInput;
  submitLabel: string;
  onSubmit: (input: EntryInput) => Promise<void>;
  onCancel?: () => void;
};

const empty: EntryInput = { name: "", startDate: "", endDate: "", leaveType: null, note: "" };

export default function LeaveForm({ idPrefix, names, initial, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<EntryInput>(initial ?? empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const id = (f: string) => `${idPrefix}-${f}`;
  const set = <K extends keyof EntryInput>(k: K, v: EntryInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = entryInput.safeParse(form);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setBusy(true);
    try {
      await onSubmit(parsed.data);
      if (!initial) setForm(empty);
      setErrors({});
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof EntryInput) =>
    errors[k] ? { "aria-invalid": true as const, "aria-describedby": `${id(k)}-error` } : {};

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <Field id={id("name")} label="Team member" error={errors.name}>
        <NameCombobox id={id("name")} value={form.name} onChange={(v) => set("name", v)} names={names} invalid={!!errors.name} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id={id("startDate")} label="Start date" error={errors.startDate}>
          <Input id={id("startDate")} type="date" value={form.startDate} {...err("startDate")}
            onChange={(e) => { set("startDate", e.target.value); if (!form.endDate) set("endDate", e.target.value); }} />
        </Field>
        <Field id={id("endDate")} label="End date" error={errors.endDate}>
          <Input id={id("endDate")} type="date" value={form.endDate} min={form.startDate || undefined} {...err("endDate")}
            onChange={(e) => set("endDate", e.target.value)} />
        </Field>
      </div>
      <Field id={id("leaveType")} label="Reason" optional>
        <select id={id("leaveType")} className={inputClass} value={form.leaveType ?? ""}
          onChange={(e) => set("leaveType", (e.target.value || null) as LeaveType | null)}>
          <option value="">Not specified</option>
          {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
        </select>
      </Field>
      <Field id={id("note")} label="Note" optional error={errors.note}>
        <Input id={id("note")} value={form.note ?? ""} maxLength={200} placeholder="e.g. Family trip"
          onChange={(e) => set("note", e.target.value)} {...err("note")} />
      </Field>
      {formError && <p role="alert" className="text-[12px] text-error bg-error-soft rounded-md px-2 py-1.5">{formError}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}
