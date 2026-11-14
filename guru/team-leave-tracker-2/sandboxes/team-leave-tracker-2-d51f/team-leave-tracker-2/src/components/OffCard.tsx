import clsx from "clsx";
import { dayCount, overlaps, rangeLabel, weekdayLetter } from "@/lib/leave/dates";
import type { LeaveEntry } from "@/lib/leave/schema";
import { LeaveBadge } from "./ui/LeaveBadge";

type Props = { name: string; entries: LeaveEntry[]; days: string[]; today: string };

export default function OffCard({ name, entries, days, today }: Props) {
  const out = (d: string) => entries.some((e) => overlaps(e.startDate, e.endDate, d, d));
  const outCount = days.filter(out).length;
  return (
    <article className="bg-surface border border-border rounded-md p-4 hover:shadow-elev transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="size-8 shrink-0 rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center" aria-hidden>
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{name}</h3>
          <p className="text-[12px] text-ink-muted">
            Out {outCount} of 7 days this week
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {entries.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-mono">{rangeLabel(e.startDate, e.endDate)}</span>
            <span className="text-ink-muted">({dayCount(e.startDate, e.endDate)}d)</span>
            <LeaveBadge type={e.leaveType} showLabel />
            {e.note && <span className="text-ink-muted truncate max-w-full">{e.note}</span>}
          </li>
        ))}
      </ul>
      <ol className="grid grid-cols-7 gap-1" aria-label={`Days ${name} is out`}>
        {days.map((d) => {
          const isOut = out(d);
          return (
            <li
              key={d}
              title={`${weekdayLetter(d)} ${d}: ${isOut ? "out" : "in"}`}
              className={clsx(
                "h-9 rounded-md flex flex-col items-center justify-center text-[11px] leading-3 border",
                isOut ? "bg-primary text-on-primary border-primary" : "bg-surface-muted text-ink-faint border-transparent",
                d === today && "ring-2 ring-offset-1 ring-primary/40 ring-offset-surface",
              )}
            >
              <span className="font-medium">{weekdayLetter(d).slice(0, 2)}</span>
              <span className="font-mono">{Number(d.slice(8))}</span>
              <span className="sr-only">{isOut ? "out" : "in"}</span>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
