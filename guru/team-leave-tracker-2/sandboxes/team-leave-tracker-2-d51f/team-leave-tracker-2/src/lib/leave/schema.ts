import { z } from "zod";

export const LEAVE_TYPES = ["vacation", "sick", "personal", "other"] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export type LeaveEntry = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: LeaveType | null;
  note: string | null;
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((s) => {
    const d = new Date(s + "T00:00:00Z");
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Enter a valid date");

export const entryInput = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
    startDate: isoDate,
    endDate: isoDate,
    leaveType: z.enum(LEAVE_TYPES).nullable().optional(),
    note: z.string().trim().max(200, "Note is too long").nullable().optional(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type EntryInput = z.infer<typeof entryInput>;
export type FieldErrors = Partial<Record<keyof EntryInput, string>>;

export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path[0] as keyof EntryInput;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
