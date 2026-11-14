"use client";
import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { addDays, overlaps, weekDays, weekStart } from "@/lib/leave/dates";
import type { LeaveEntry } from "@/lib/leave/schema";
import { Card, CardHeader } from "./ui/Card";
import WeekNav from "./WeekNav";
import OffCard from "./OffCard";

type Props = { entries: LeaveEntry[]; today: string };

export default function WhosOff({ entries, today }: Props) {
  const current = weekStart(today);
  const [start, setStart] = useState(current);
  const days = weekDays(start);
  const end = addDays(start, 6);

  const people = useMemo(() => {
    const byName = new Map<string, LeaveEntry[]>();
    for (const e of entries) {
      if (!overlaps(e.startDate, e.endDate, start, end)) continue;
      const list = byName.get(e.name) ?? [];
      list.push(e);
      byName.set(e.name, list);
    }
    return [...byName.entries()]
      .map(([name, list]) => ({ name, list: list.sort((a, b) => a.startDate.localeCompare(b.startDate)) }))
      .sort((a, b) => a.list[0].startDate.localeCompare(b.list[0].startDate) || a.name.localeCompare(b.name));
  }, [entries, start, end]);

  const isCurrent = start === current;
  const title = isCurrent ? "Who's off this week" : start < current ? "Who was off" : "Who's off";
  const subtitle = `${people.length} ${people.length === 1 ? "person" : "people"} out · Sun–Sat`;

  return (
    <Card aria-label="Who's off">
      <CardHeader
        title={title}
        subtitle={subtitle}
        actions={<WeekNav start={start} isCurrent={isCurrent} onChange={setStart} onToday={() => setStart(current)} />}
      />
      <div className="p-4">
        {people.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-ink-muted">
            <CalendarCheck className="size-8 text-success" aria-hidden />
            <p className="font-medium text-ink">Everyone is in this week</p>
            <p className="text-[12px]">No leave overlaps {isCurrent ? "the current" : "this"} week.</p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {people.map((p) => (
              <OffCard key={p.name} name={p.name} entries={p.list} days={days} today={today} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
