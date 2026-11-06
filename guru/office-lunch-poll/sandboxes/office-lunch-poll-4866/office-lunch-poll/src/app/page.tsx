import { LunchPoll } from "@/components/LunchPoll";
import { getPollState } from "@/lib/poll/queries";
import type { PollState } from "@/lib/poll/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initial: PollState | null = null;
  try {
    initial = await getPollState(null);
  } catch (err) {
    console.error("initial poll load:", err instanceof Error ? err.message : err);
  }
  return (
    <main className="page">
      <header className="masthead">
        <p className="masthead__kicker">Office lunch poll · open all day</p>
        <h1 className="masthead__title">
          Where are we <em>eating?</em>
        </h1>
        <p className="masthead__lede">Four spots, one click. Counts refresh on their own every few seconds.</p>
      </header>
      <LunchPoll initial={initial} />
    </main>
  );
}
