// Curated static dataset — well-known career numbers as of mid-2024.
// Used as the fallback when live API fetch fails.

const staticData = {
  sachin: {
    name: "Sachin Tendulkar",
    country: "India",
    born: "24 April 1973",
    role: "Batsman",
    battingStyle: "Right-handed",
    career: "1989–2013",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Sachin_Tendulkar_at_MRF_Pace_Foundation.jpg/220px-Sachin_Tendulkar_at_MRF_Pace_Foundation.jpg",
    formats: {
      test: {
        matches: 200,
        innings: 329,
        runs: 15921,
        notOuts: 33,
        highestScore: "248*",
        average: 53.78,
        strikeRate: 54.04,
        centuries: 51,
        doubleCenturies: 6,
        halfCenturies: 68,
        fours: 2058,
        sixes: 69
      },
      odi: {
        matches: 463,
        innings: 452,
        runs: 18426,
        notOuts: 41,
        highestScore: "200*",
        average: 44.83,
        strikeRate: 86.23,
        centuries: 49,
        doubleCenturies: 0,
        halfCenturies: 96,
        fours: 2016,
        sixes: 195
      },
      t20i: {
        matches: 1,
        innings: 1,
        runs: 10,
        notOuts: 0,
        highestScore: "10",
        average: 10.0,
        strikeRate: 100.0,
        centuries: 0,
        doubleCenturies: 0,
        halfCenturies: 0,
        fours: 1,
        sixes: 0
      }
    }
  },
  kohli: {
    name: "Virat Kohli",
    country: "India",
    born: "5 November 1988",
    role: "Batsman",
    battingStyle: "Right-handed",
    career: "2008–present",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/220px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg",
    formats: {
      test: {
        matches: 113,
        innings: 193,
        runs: 8848,
        notOuts: 18,
        highestScore: "254*",
        average: 49.42,
        strikeRate: 57.22,
        centuries: 29,
        doubleCenturies: 7,
        halfCenturies: 30,
        fours: 1021,
        sixes: 24
      },
      odi: {
        matches: 292,
        innings: 280,
        runs: 13906,
        notOuts: 48,
        highestScore: "183",
        average: 58.18,
        strikeRate: 93.25,
        centuries: 50,
        doubleCenturies: 0,
        halfCenturies: 72,
        fours: 1278,
        sixes: 152
      },
      t20i: {
        matches: 125,
        innings: 117,
        runs: 4188,
        notOuts: 21,
        highestScore: "122*",
        average: 48.69,
        strikeRate: 137.04,
        centuries: 1,
        doubleCenturies: 0,
        halfCenturies: 38,
        fours: 398,
        sixes: 100
      }
    }
  }
};

module.exports = staticData;
