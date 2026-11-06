export type Restaurant = { id: string; name: string; tagline: string };

export type Tally = Restaurant & { votes: number };

export type PollState = {
  restaurants: Tally[];
  total: number;
  myVote: string | null;
  updatedAt: string;
};
