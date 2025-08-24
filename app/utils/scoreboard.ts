export async function fetchScoreboard(sport: string, league: string) {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const url = `https://site.web.api.espn.com/apis/v2/sports/${sport}/${league}/scoreboard?dates=${date}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch scoreboard for ${sport}/${league}`);
  }
  return res.json();
}
