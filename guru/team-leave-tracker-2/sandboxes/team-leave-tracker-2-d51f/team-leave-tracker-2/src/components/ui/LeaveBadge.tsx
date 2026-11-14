import clsx from "clsx";
import type { LeaveType } from "@/lib/leave/schema";

const tones: Record<LeaveType, string> = {
  vacation: "bg-primary-soft text-primary",
  sick: "bg-error-soft text-error",
  personal: "bg-success-soft text-success",
  other: "bg-warning-soft text-warning",
};

export function LeaveBadge({ type, showLabel = false }: { type: LeaveType | null; showLabel?: boolean }) {
  if (!type) return null;
  return (
    <span
      title={`Reason: ${type}`}
      aria-label={`Reason: ${type}`}
      className={clsx("inline-flex items-center gap-1 rounded-full px-2 h-5 text-[12px] font-medium", tones[type])}
    >
      {showLabel && <span className="opacity-75 font-normal">Reason:</span>}
      <span className="capitalize">{type}</span>
    </span>
  );
}
