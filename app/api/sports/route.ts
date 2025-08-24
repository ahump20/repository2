export const runtime = "nodejs";

const SPORTS_ENDPOINTS: Record<string, {sport: string; league: string}> = {
  mlb: { sport: "baseball", league: "mlb" },
  nfl: { sport: "football", league: "nfl" },
  nba: { sport: "basketball", league: "nba" },
  collegeFootball: { sport: "football", league: "college-football" },
  collegeBaseball: { sport: "baseball", league: "college-baseball" },
};

async function getScoreboard(sport: string, league: string) {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const url = `https://site.web.api.espn.com/apis/v2/sports/${sport}/${league}/scoreboard?dates=${date}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch scoreboard for ${sport}/${league}`);
  }
  return res.json();
}

export async function GET() {
  const results: Record<string, unknown> = {};
  for (const [key, { sport, league }] of Object.entries(SPORTS_ENDPOINTS)) {
    try {
      results[key] = await getScoreboard(sport, league);
    } catch (err) {
      results[key] = { error: (err as Error).message };
    }
  }
  return Response.json(results);
}
