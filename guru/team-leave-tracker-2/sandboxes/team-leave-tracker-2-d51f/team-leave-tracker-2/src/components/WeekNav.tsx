"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, longDate, shortDate } from "@/lib/leave/dates";
import { Button } from "./ui/Button";

type Props = {
  /** Sunday that starts the shown week (Sun–Sat). */
  start: string;
  isCurrent: boolean;
  onChange: (start: string) => void;
  onToday: () => void;
};

export default function WeekNav({ start, isCurrent, onChange, onToday }: Props) {
  const end = addDays(start, 6);
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" aria-label="Previous week" onClick={() => onChange(addDays(start, -7))}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-[14px] font-medium min-w-[180px] text-center" aria-live="polite">
        {shortDate(start)} – {longDate(end)}
      </span>
      <Button variant="secondary" size="icon" aria-label="Next week" onClick={() => onChange(addDays(start, 7))}>
        <ChevronRight className="size-4" />
      </Button>
      <Button variant="secondary" onClick={onToday} disabled={isCurrent}>
        This week
      </Button>
    </div>
  );
}
