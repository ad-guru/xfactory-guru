"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/url";
import { voterToken } from "@/lib/poll/voterToken";
import type { PollState } from "@/lib/poll/types";

const POLL_MS = 4000;

export function usePoll(initial: PollState | null) {
  const [state, setState] = useState<PollState | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const token = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    token.current ??= voterToken();
    const url = apiUrl("api/votes");
    url.searchParams.set("token", token.current);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Poll unavailable");
      setState(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Poll unavailable");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const vote = useCallback(async (restaurantId: string) => {
    token.current ??= voterToken();
    setPending(restaurantId);
    try {
      const res = await fetch(apiUrl("api/votes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.current, restaurantId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Vote failed");
      setState(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vote failed");
    } finally {
      setPending(null);
    }
  }, []);

  return { state, error, pending, vote };
}
