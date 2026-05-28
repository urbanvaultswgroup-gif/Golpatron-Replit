const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export interface LiveMatch {
  id: string;
  home: string;
  away: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  status: string;
  stage: string;
  homeLogo: string;
  awayLogo: string;
  homeColor: string;
  awayColor: string;
}

export interface Fixture {
  id: string;
  home: string;
  away: string;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  minute: string;
  status: string;
  stage: string;
  kickoff: string;
  homeLogo: string;
  awayLogo: string;
  homeColor: string;
  awayColor: string;
}

export interface TopScorer {
  rank: number;
  name: string;
  country: string;
  countryName: string;
  teamColor: string;
  goals: number;
  assists: number;
  rating: number;
  photo: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  time: string;
  tag: string;
  team: string | null;
}

export const footballApi = {
  getLive: () =>
    apiFetch<{ matches: LiveMatch[]; source: string }>("/api/football/live"),

  getFixtures: () =>
    apiFetch<{ fixtures: Fixture[]; source: string }>("/api/football/fixtures"),

  getTopScorers: () =>
    apiFetch<{ topscorers: TopScorer[]; source: string }>("/api/football/topscorers"),

  getNews: () =>
    apiFetch<{ news: NewsItem[] }>("/api/football/news"),
};
