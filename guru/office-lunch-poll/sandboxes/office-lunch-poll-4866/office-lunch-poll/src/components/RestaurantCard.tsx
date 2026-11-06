import type { Tally } from "@/lib/poll/types";

type Props = {
  tally: Tally;
  index: number;
  total: number;
  leading: boolean;
  mine: boolean;
  pending: boolean;
  onVote: (id: string) => void;
};

export function RestaurantCard({ tally, index, total, leading, mine, pending, onVote }: Props) {
  const pct = total ? Math.round((tally.votes / total) * 100) : 0;
  return (
    <li className={`card${mine ? " card--mine" : ""}`} style={{ animationDelay: `${index * 90}ms` }}>
      <div className="card__head">
        <span className="card__num">No. {String(index + 1).padStart(2, "0")}</span>
        {leading && <span className="card__stamp">Leading</span>}
      </div>
      <h2 className="card__name">{tally.name}</h2>
      {tally.tagline && (
        <p className="card__tagline">
          <em>{tally.tagline}</em>
        </p>
      )}

      <div className="card__count" aria-live="polite">
        <span className="card__votes">{tally.votes}</span>
        <span className="card__unit">{tally.votes === 1 ? "vote" : "votes"}</span>
        <span className="card__pct">{pct}%</span>
      </div>
      <div className="bar" role="img" aria-label={`${pct}% of votes`}>
        <div className="bar__fill" style={{ width: `${pct}%` }} />
      </div>

      <button
        type="button"
        className="card__btn"
        onClick={() => onVote(tally.id)}
        disabled={mine || pending}
        aria-pressed={mine}
      >
        {mine ? "Your pick ✓" : pending ? "Saving…" : "Vote for this"}
      </button>
    </li>
  );
}
