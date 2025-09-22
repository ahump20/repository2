import React from "react";
import { sportsCategories } from "../categories";
import { fetchScoreboard } from "@/app/utils/scoreboard";

type Props = {
  params: { category: string };
};

const SCOREBOARD_MAP: Record<string, { sport: string; league: string }> = {
  mlb: { sport: "baseball", league: "mlb" },
  nfl: { sport: "football", league: "nfl" },
  nba: { sport: "basketball", league: "nba" },
  college: { sport: "football", league: "college-football" },
};

const SportPage = async ({ params }: Props) => {
  const category = sportsCategories.find((c) => c.id === params.category);
  if (!category) {
    return <div>Unknown category: {params.category}</div>;
  }

  let scoreboard: unknown = null;
  const endpoint = SCOREBOARD_MAP[params.category];
  if (endpoint) {
    try {
      scoreboard = await fetchScoreboard(endpoint.sport, endpoint.league);
    } catch (err) {
      scoreboard = { error: (err as Error).message };
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>{category.name}</h1>
      {scoreboard ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(scoreboard, null, 2)}</pre>
      ) : (
        <p>
          Research and content for {category.name} will appear here as Blaze Intelligence expands its
          coverage.
        </p>
      )}
    </main>
  );
};

export default SportPage;
