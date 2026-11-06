const KEY = "lunch-poll-voter-token";

/** Best-effort per-browser identity; no login, so this is a light guard only. */
export function voterToken(): string {
  let t = window.localStorage.getItem(KEY);
  if (!t) {
    t = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : fallbackUuid();
    window.localStorage.setItem(KEY, t);
  }
  return t;
}

function fallbackUuid(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
