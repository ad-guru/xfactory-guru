"use client";
import type { PollState } from "@/lib/poll/types";
import { RestaurantCard } from "./RestaurantCard";
import { usePoll } from "./usePoll";

export function LunchPoll({ initial }: { initial: PollState | null }) {
  const { state, error, pending, vote } = usePoll(initial);

  if (!state) {
    return <p className="status">{error ?? "Loading today's menu…"}</p>;
  }

  const top = Math.max(...state.restaurants.map((r) => r.votes));
  const time = new Date(state.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <>
      <div className="meta">
        <span>
          <strong>{state.total}</strong> {state.total === 1 ? "vote" : "votes"} in
        </span>
        <span className="meta__live">
          <i className="dot" aria-hidden /> Live · updated {time}
        </span>
      </div>
      {error && <p className="status status--error">{error}. Retrying…</p>}
      <ol className="cards">
        {state.restaurants.map((r, i) => (
          <RestaurantCard
            key={r.id}
            tally={r}
            index={i}
            total={state.total}
            leading={top > 0 && r.votes === top}
            mine={state.myVote === r.id}
            pending={pending === r.id}
            onVote={vote}
          />
        ))}
      </ol>
      <p className="footnote">
        {state.myVote
          ? "You've voted. Changed your mind? Pick another place and your vote moves with you."
          : "One vote per browser. You can change it any time before lunch."}
      </p>
    </>
  );
}
