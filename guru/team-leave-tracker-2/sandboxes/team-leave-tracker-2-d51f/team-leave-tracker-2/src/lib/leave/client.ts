"use client";
import { apiUrl } from "../url";
import type { EntryInput, FieldErrors, LeaveEntry } from "./schema";

export class ApiError extends Error {
  constructor(message: string, public fields: FieldErrors = {}) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, body.fields);
  return body as T;
}

export const api = {
  list: () => call<{ entries: LeaveEntry[] }>("api/entries").then((b) => b.entries),
  create: (input: EntryInput) =>
    call<{ entry: LeaveEntry }>("api/entries", { method: "POST", body: JSON.stringify(input) }).then((b) => b.entry),
  update: (id: string, input: EntryInput) =>
    call<{ entry: LeaveEntry }>(`api/entries/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }).then((b) => b.entry),
  remove: (id: string) => call<{ ok: true }>(`api/entries/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
