import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const APISPORTS_BASE = "https://v3.football.api-sports.io";
const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

// Team code → full name mapping
const TEAM_NAME_TO_CODE: Record<string, string> = {
  Mexico: "MEX",
  Argentina: "ARG",
  Brazil: "BRA",
  France: "FRA",
  England: "ENG",
  Spain: "ESP",
  Portugal: "POR",
  Germany: "GER",
  Netherlands: "NED",
  Italy: "ITA",
  Croatia: "CRO",
  Morocco: "MAR",
  Japan: "JPN",
  "South Korea": "KOR",
  "United States": "USA",
  Canada: "CAN",
  Uruguay: "URY",
  Colombia: "COL",
  Ecuador: "ECU",
  Senegal: "SEN",
  Ghana: "GHA",
  Cameroon: "CMR",
  Australia: "AUS",
  "Saudi Arabia": "KSA",
  Qatar: "QAT",
  Switzerland: "SUI",
  Belgium: "BEL",
  Denmark: "DEN",
  Poland: "POL",
  "Costa Rica": "CRC",
  Wales: "WAL",
  Tunisia: "TUN",
};

const TEAM_COLORS: Record<string, string> = {
  MEX: "#006847",
  ARG: "#4B9CD3",
  BRA: "#009C3B",
  FRA: "#0055A4",
  ENG: "#CF091D",
  ESP: "#C60B1E",
  POR: "#006600",
  GER: "#DD0000",
  NED: "#FF6600",
  ITA: "#009246",
  CRO: "#FF0000",
  MAR: "#C1272D",
  USA: "#002868",
  CAN: "#FF0000",
  COL: "#FCD116",
  URY: "#5EB6E4",
};

function getTeamCode(name: string): string {
  return TEAM_NAME_TO_CODE[name] ?? name.substring(0, 3).toUpperCase();
}

function getTeamColor(code: string): string {
  return TEAM_COLORS[code] ?? "#333A4D";
}

function getStatusLabel(status: { short: string; elapsed: number | null }): string {
  if (status.short === "1H" || status.short === "2H") {
    return status.elapsed ? `${status.elapsed}` : "LIVE";
  }
  if (status.short === "HT") return "HT";
  if (status.short === "FT") return "FT";
  if (status.short === "NS") return "NS";
  return status.short;
}

async function callApiSports(path: string): Promise<any> {
  const apiKey = process.env.APIFOOTBALL_KEY;
  if (!apiKey) throw new Error("APIFOOTBALL_KEY not configured");

  const response = await fetch(`${APISPORTS_BASE}${path}`, {
    headers: { "x-apisports-key": apiKey },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`API Sports HTTP ${response.status}`);

  const data = await response.json() as any;

  if (data.errors && typeof data.errors === "object" && Object.keys(data.errors).length > 0) {
    throw new Error(`API quota/error: ${JSON.stringify(data.errors)}`);
  }

  return data;
}

// ─── MOCK FALLBACK DATA ───────────────────────────────────────────────────────

const MOCK_LIVE = [
  {
    id: "m1", home: "MEX", away: "ARG", homeName: "Mexico", awayName: "Argentina",
    homeScore: 1, awayScore: 1, minute: "72", status: "LIVE", stage: "Quarter-Final",
    homeLogo: "", awayLogo: "", homeColor: "#006847", awayColor: "#4B9CD3",
  },
  {
    id: "m2", home: "FRA", away: "ENG", homeName: "France", awayName: "England",
    homeScore: 2, awayScore: 1, minute: "45", status: "LIVE", stage: "Semi-Final",
    homeLogo: "", awayLogo: "", homeColor: "#0055A4", awayColor: "#CF091D",
  },
  {
    id: "m3", home: "ESP", away: "GER", homeName: "Spain", awayName: "Germany",
    homeScore: 0, awayScore: 0, minute: "23", status: "LIVE", stage: "Quarter-Final",
    homeLogo: "", awayLogo: "", homeColor: "#C60B1E", awayColor: "#DD0000",
  },
  {
    id: "m4", home: "BRA", away: "POR", homeName: "Brazil", awayName: "Portugal",
    homeScore: 3, awayScore: 2, minute: "89", status: "LIVE", stage: "Quarter-Final",
    homeLogo: "", awayLogo: "", homeColor: "#009C3B", awayColor: "#006600",
  },
];

const MOCK_FIXTURES = [
  {
    id: "f1", home: "MEX", away: "BRA", homeName: "Mexico", awayName: "Brazil",
    homeScore: null, awayScore: null, minute: "", status: "NS", stage: "Semi-Final",
    kickoff: "2026-05-29T20:00:00Z", homeLogo: "", awayLogo: "",
    homeColor: "#006847", awayColor: "#009C3B",
  },
  {
    id: "f2", home: "FRA", away: "ESP", homeName: "France", awayName: "Spain",
    homeScore: null, awayScore: null, minute: "", status: "NS", stage: "Semi-Final",
    kickoff: "2026-05-29T23:00:00Z", homeLogo: "", awayLogo: "",
    homeColor: "#0055A4", awayColor: "#C60B1E",
  },
  {
    id: "f3", home: "ENG", away: "ARG", homeName: "England", awayName: "Argentina",
    homeScore: null, awayScore: null, minute: "", status: "NS", stage: "3rd Place",
    kickoff: "2026-05-30T20:00:00Z", homeLogo: "", awayLogo: "",
    homeColor: "#CF091D", awayColor: "#4B9CD3",
  },
];

const MOCK_TOPSCORERS = [
  { rank: 1, name: "Kylian Mbappe", country: "FRA", countryName: "France", teamColor: "#0055A4", goals: 8, assists: 3, rating: 9.4, photo: "" },
  { rank: 2, name: "Lionel Messi", country: "ARG", countryName: "Argentina", teamColor: "#4B9CD3", goals: 6, assists: 5, rating: 9.2, photo: "" },
  { rank: 3, name: "Cristiano Ronaldo", country: "POR", countryName: "Portugal", teamColor: "#006600", goals: 6, assists: 1, rating: 8.8, photo: "" },
  { rank: 4, name: "Vinicius Jr", country: "BRA", countryName: "Brazil", teamColor: "#009C3B", goals: 5, assists: 4, rating: 8.7, photo: "" },
  { rank: 5, name: "Harry Kane", country: "ENG", countryName: "England", teamColor: "#CF091D", goals: 4, assists: 2, rating: 8.1, photo: "" },
  { rank: 6, name: "Alvaro Morata", country: "ESP", countryName: "Spain", teamColor: "#C60B1E", goals: 4, assists: 1, rating: 7.9, photo: "" },
  { rank: 7, name: "Chucky Lozano", country: "MEX", countryName: "Mexico", teamColor: "#006847", goals: 3, assists: 2, rating: 8.2, photo: "" },
  { rank: 8, name: "Jude Bellingham", country: "ENG", countryName: "England", teamColor: "#CF091D", goals: 2, assists: 3, rating: 8.5, photo: "" },
  { rank: 9, name: "Antoine Griezmann", country: "FRA", countryName: "France", teamColor: "#0055A4", goals: 2, assists: 6, rating: 8.3, photo: "" },
  { rank: 10, name: "Lautaro Martinez", country: "ARG", countryName: "Argentina", teamColor: "#4B9CD3", goals: 2, assists: 2, rating: 8.0, photo: "" },
];

const MOCK_NEWS = [
  { id: "n1", headline: "Chucky Lozano equalizes — el tri is ALIVE!", time: "3m ago", tag: "GOAL", team: "MEX" },
  { id: "n2", headline: "Mexico advances to QF for first time since 1986", time: "11m ago", tag: "MUNDIAL", team: "MEX" },
  { id: "n3", headline: "VAR overturns penalty decision in France clash", time: "18m ago", tag: "VAR", team: null },
  { id: "n4", headline: "Mbappe hat-trick completed — France lead by two", time: "25m ago", tag: "GOAL", team: "FRA" },
];

// ─── ROUTES ──────────────────────────────────────────────────────────────────

router.get("/football/live", async (req, res): Promise<void> => {
  try {
    const data = await callApiSports("/fixtures?live=all");
    const fixtures = (data.response ?? []) as any[];

    const worldCup = fixtures.filter((f: any) => f.league?.id === WORLD_CUP_LEAGUE_ID);
    const source = worldCup.length > 0 ? worldCup : fixtures;

    const matches = source.slice(0, 8).map((f: any) => {
      const homeCode = getTeamCode(f.teams.home.name);
      const awayCode = getTeamCode(f.teams.away.name);
      return {
        id: String(f.fixture.id),
        home: homeCode,
        away: awayCode,
        homeName: f.teams.home.name,
        awayName: f.teams.away.name,
        homeScore: f.goals.home ?? 0,
        awayScore: f.goals.away ?? 0,
        minute: getStatusLabel(f.fixture.status),
        status: "LIVE",
        stage: f.league.round ?? "Match",
        homeLogo: f.teams.home.logo ?? "",
        awayLogo: f.teams.away.logo ?? "",
        homeColor: getTeamColor(homeCode),
        awayColor: getTeamColor(awayCode),
      };
    });

    res.json({ matches, source: "live" });
  } catch (err) {
    req.log.warn({ err: String(err) }, "Football live API failed, using mock");
    res.json({ matches: MOCK_LIVE, source: "mock" });
  }
});

router.get("/football/fixtures", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  try {
    const data = await callApiSports(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}&from=${today}&to=${today}`
    );
    const fixtures = (data.response ?? []) as any[];

    const result = fixtures.map((f: any) => {
      const homeCode = getTeamCode(f.teams.home.name);
      const awayCode = getTeamCode(f.teams.away.name);
      return {
        id: String(f.fixture.id),
        home: homeCode,
        away: awayCode,
        homeName: f.teams.home.name,
        awayName: f.teams.away.name,
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        minute: getStatusLabel(f.fixture.status),
        status: f.fixture.status.short,
        stage: f.league.round ?? "Match",
        kickoff: f.fixture.date,
        homeLogo: f.teams.home.logo ?? "",
        awayLogo: f.teams.away.logo ?? "",
        homeColor: getTeamColor(homeCode),
        awayColor: getTeamColor(awayCode),
      };
    });

    res.json({ fixtures: result, source: "live" });
  } catch (err) {
    req.log.warn({ err: String(err) }, "Football fixtures API failed, using mock");
    res.json({ fixtures: MOCK_FIXTURES, source: "mock" });
  }
});

router.get("/football/topscorers", async (req, res): Promise<void> => {
  try {
    const data = await callApiSports(
      `/players/topscorers?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`
    );
    const players = (data.response ?? []) as any[];

    const topscorers = players.slice(0, 15).map((p: any, idx: number) => {
      const stats = p.statistics[0];
      const countryCode = getTeamCode(stats.team.name);
      return {
        rank: idx + 1,
        name: p.player.name,
        country: countryCode,
        countryName: stats.team.name,
        teamColor: getTeamColor(countryCode),
        goals: stats.goals.total ?? 0,
        assists: stats.goals.assists ?? 0,
        rating: parseFloat(stats.games.rating ?? "7.0"),
        photo: p.player.photo ?? "",
      };
    });

    res.json({ topscorers, source: "live" });
  } catch (err) {
    req.log.warn({ err: String(err) }, "Football topscorers API failed, using mock");
    res.json({ topscorers: MOCK_TOPSCORERS, source: "mock" });
  }
});

router.get("/football/news", async (_req, res): Promise<void> => {
  // News isn't available from api-football.com, always return curated mock
  res.json({ news: MOCK_NEWS });
});

export default router;
