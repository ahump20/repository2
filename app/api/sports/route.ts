export const runtime = "nodejs";

import { fetchScoreboard } from "@/app/utils/scoreboard";

const SPORTS_ENDPOINTS: Record<string, { sport: string; league: string }> = {
  mlb: { sport: "baseball", league: "mlb" },
  nfl: { sport: "football", league: "nfl" },
  nba: { sport: "basketball", league: "nba" },
  collegeFootball: { sport: "football", league: "college-football" },
  collegeBaseball: { sport: "baseball", league: "college-baseball" },
};

export async function GET() {
  const results: Record<string, unknown> = {};
  for (const [key, { sport, league }] of Object.entries(SPORTS_ENDPOINTS)) {
    try {
      results[key] = await fetchScoreboard(sport, league);
    } catch (err) {
      results[key] = { error: (err as Error).message };
    }
  }
  return Response.json(results);
}
