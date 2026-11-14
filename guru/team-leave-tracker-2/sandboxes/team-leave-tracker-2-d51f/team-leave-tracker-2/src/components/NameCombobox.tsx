"use client";
import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, Plus, UserRound } from "lucide-react";
import clsx from "clsx";
import { inputClass } from "./ui/Input";

type Props = {
  id: string;
  value: string;
  onChange: (name: string) => void;
  names: string[];
  invalid?: boolean;
};

type Option = { key: string; name: string; isNew: boolean };

/** Combobox: suggests existing names, accepts any newly typed name. */
export default function NameCombobox({ id, value, onChange, names, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const query = value.trim();
  const options = useMemo<Option[]>(() => {
    const q = query.toLowerCase();
    const list: Option[] = names
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 8)
      .map((n) => ({ key: n, name: n, isNew: false }));
    if (query && !names.some((n) => n.toLowerCase() === q)) list.push({ key: "__new", name: query, isNew: true });
    return list;
  }, [names, query]);
  const show = open && options.length > 0;
  const listId = `${id}-list`;
  const optId = (i: number) => `${id}-opt-${i}`;

  function pick(name: string) {
    onChange(name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + d + options.length) % Math.max(options.length, 1));
    } else if (e.key === "Enter" && show) {
      e.preventDefault();
      pick(options[Math.min(active, options.length - 1)].name);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Popover.Root open={show} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="relative">
          <UserRound className="size-4 absolute left-2.5 top-2 text-ink-faint" aria-hidden />
          <input
            id={id}
            role="combobox"
            aria-expanded={show}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={show ? optId(active) : undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-error` : undefined}
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            placeholder="Type or pick a name"
            autoComplete="off"
            className={clsx(inputClass, "pl-8", invalid && "border-error")}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
          className="z-50 w-[var(--radix-popover-trigger-width)] bg-surface text-ink border border-border rounded-md shadow-elev p-1"
        >
          <ul id={listId} role="listbox" aria-label="Team members">
            {options.map((o, i) => (
              <li
                key={o.key}
                id={optId(i)}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o.name)}
                className={clsx("flex items-center gap-2 px-2 h-8 rounded-md cursor-pointer", i === active && "bg-surface-muted")}
              >
                {o.isNew ? (
                  <><Plus className="size-4 text-primary" aria-hidden />Add &ldquo;{o.name}&rdquo; as a new name</>
                ) : (
                  <><Check className={clsx("size-4 text-primary", o.name !== value && "invisible")} aria-hidden />{o.name}</>
                )}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
