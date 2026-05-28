# GolPatrón

A premium FIFA Mundial 2026 social companion mobile app — live match scores, fan rooms, predictions, player rankings, and a team-based dynamic theme system.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mobile run dev` — run the Expo app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `APIFOOTBALL_KEY` — api-sports.io key (stored as Replit Secret)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router v4, React Native 0.81.5
- API: Express 5 + pino logging
- State: React Query (TanStack) + AsyncStorage for persistence
- Fonts: Inter (400/500/600/700)
- Animations: react-native-reanimated, expo-haptics

## Where things live

- `artifacts/mobile/` — Expo app
  - `app/(tabs)/` — five screens: index (home), rooms, predict, rankings, profile
  - `contexts/ThemeContext.tsx` — dynamic team theme system
  - `hooks/useColors.ts` — reads from ThemeContext, returns color tokens
  - `constants/colors.ts` — dark palette (light/dark both use same dark palette)
  - `services/footballApi.ts` — typed fetch helpers for all API server routes
  - `components/LiveBadge.tsx` — pulsing LIVE indicator with minute
- `artifacts/api-server/` — Express 5 API
  - `src/routes/football.ts` — proxy routes for api-sports.io + smart mock fallback
  - `src/routes/health.ts` — health check
- `lib/` — shared TypeScript libraries

## Football API

- Provider: **api-football.com** (api-sports.io) — v3
- Base URL: `https://v3.football.api-sports.io`
- Auth: `x-apisports-key: <APIFOOTBALL_KEY>` header
- Free plan: 100 requests/day, resets at midnight UTC
- Routes proxied by API server:
  - `GET /api/football/live` — live matches (30s refetch in app)
  - `GET /api/football/fixtures` — today's fixtures (2min refetch)
  - `GET /api/football/topscorers` — World Cup top scorers (2min refetch)
  - `GET /api/football/news` — curated flash news (always mock)
- If API fails or quota reached → server returns realistic mock data; app shows DEMO badge

## Architecture decisions

- API server acts as proxy so the API key is never exposed to the mobile client
- Team code→color mapping lives in `football.ts` server-side; mobile receives `homeColor`/`awayColor` directly
- Dynamic theme: selecting a flag in Profile tab changes `ThemeContext`, `useColors()` adapts all screens instantly
- All mobile persistence (profile, fan room membership) uses AsyncStorage only — no backend DB needed
- `EXPO_PUBLIC_DOMAIN` env var injected by workflow; mobile builds `BASE_URL` from it

## Product

- **Home**: Hero live match with stadium image, live match ribbon, next match countdown, flash news, highlights
- **Fan Rooms**: Compact list of fan rooms by country with live score strip, mood tags, member counts
- **Predictions**: Bracket-style match predictions with point tracking
- **Rankings**: Top scorers with goals/assists/rating tabs, podium for top 3, full list below
- **Profile**: Country selection (changes app theme color), stats, settings

## User preferences

- No emojis anywhere in the UI or code
- Dark premium aesthetic throughout
- Always use `EXPO_PUBLIC_DOMAIN` for API calls from mobile (never hardcode localhost)
- Never run `npx expo start` directly — use `restart_workflow`

## Gotchas

- API free plan: 100 req/day — use mock fallback, don't spam the endpoint
- The `APIFOOTBALL_KEY` secret must be set in Replit Secrets for real data to flow
- Mobile accesses API server through shared proxy (`/api/...`) — never call port 5000 directly
- `pnpm run typecheck` at root builds libs then checks all packages
- Expo web preview uses `Platform.OS === "web"` guard for top padding (not `insets.top`)
