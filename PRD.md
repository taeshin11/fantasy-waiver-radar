# FantasyWaiverRadar — PRD
## Project 25: Fantasy Waiver Wire Trending Players Dashboard

---

## Overview

FantasyWaiverRadar is a free, SEO-optimized dashboard that surfaces trending waiver wire players across fantasy football, basketball, and baseball. It aggregates pickup trends from Sleeper and ESPN public APIs, combines them with static injury/news JSON, and presents actionable insights organized by sport, position, and team — all pre-built as indexable pages.

**Primary Value Proposition:** The fastest, cleanest free waiver wire tool — see who's trending right now, why they're trending, and whether they're worth picking up, without logging in or paying.

---

## Target Users

- Fantasy football players checking waiver wire Sunday night / Monday
- Fantasy basketball managers looking for hot streamers
- Fantasy baseball daily roster managers
- Casual players who need quick, clear recommendations
- Fantasy sports content creators and analysts

---

## Core Features

1. **Trending Players Feed** — Real-time pickup % changes from Sleeper + ESPN
2. **Sport Landing Pages** — Dedicated pages for NFL, NBA, MLB with sport-specific UI
3. **Position Pages** — Waiver trends by position (QB, RB, WR, TE for NFL; PG, SG, SF, PF, C for NBA; etc.)
4. **Player Profile Pages** — Trend history, recent news, injury status, season stats
5. **Team Pages** — Waiver-relevant players on each team (injuries, opportunity changes)
6. **Recommendation Engine** — "Pick up now" / "Watch" / "Drop" badges based on trend signals
7. **Injury Tracker** — Static injury JSON updated regularly, surfaced on player pages
8. **Historical Trend Charts** — Player pickup % over last 7 days

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | ISR — waiver trends change hourly |
| Styling | Tailwind CSS v3 | Mobile-first |
| Charts | Chart.js + react-chartjs-2 | Trend sparklines |
| Language | TypeScript | Type safety |
| Hosting | Vercel (free tier) | ISR support |
| Backend | Railway free tier | Cron job to refresh Sleeper/ESPN data hourly |
| State | Zustand | Sport/position filter state |
| i18n | next-i18next | 8-language support |

---

## Data Sources (All Free)

| Source | Data | Access |
|---|---|---|
| Sleeper API (free, public) | Player trending (add %), league data, player info | `https://api.sleeper.app/v1/players/nfl/trending/add` (no key) |
| ESPN Public API (unofficial) | Fantasy player ownership %, team rosters | `https://fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players` (no key) |
| ESPN News (public) | Player news feed | ESPN player news endpoint (public, scrape-friendly) |
| Static JSON (repo) | Player base info (name, pos, team, headshot URL) | `data/players/[sport].json` (seeded from Sleeper player list) |
| Static JSON (repo) | Injury reports | `data/injuries/[sport].json` (updated manually or via cron) |
| Static JSON (repo) | Team rosters + depth charts | `data/teams/[sport].json` |
| FantasyPros (public pages) | Position rankings (scraped/static) | Static seed data only |

**Sleeper API endpoints used:**
```
GET https://api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=50
GET https://api.sleeper.app/v1/players/nba/trending/add?lookback_hours=24&limit=50
GET https://api.sleeper.app/v1/players/mlb/trending/add?lookback_hours=24&limit=50
GET https://api.sleeper.app/v1/players/nfl              # Full player list (huge, cache daily)
```

---

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://fantasy-waiver-radar.vercel.app
GOOGLE_SHEETS_WEBHOOK_URL=your_apps_script_url
REDIS_URL=your_railway_redis_url
```

**No paid API keys required. All data sources are public.**

---

## Backend Architecture (Railway Free Tier)

Lightweight cron service refreshes trend data:

```
fantasy-waiver-radar-cron/
├── index.ts                   # Express + cron
├── jobs/
│   ├── fetch-sleeper-nfl.ts   # NFL trending from Sleeper
│   ├── fetch-sleeper-nba.ts   # NBA trending
│   ├── fetch-sleeper-mlb.ts   # MLB trending
│   ├── fetch-espn-news.ts     # ESPN player news
│   └── store-redis.ts         # Cache to Railway Redis
├── package.json
└── Dockerfile
```

**Cron schedule:**
- Trending players: every 1 hour
- Player news: every 30 minutes
- Player base data (full list): once daily

---

## Trend Signal / Recommendation Logic

```typescript
type TrendSignal = 'hot' | 'rising' | 'watch' | 'cooling' | 'neutral';
type Recommendation = 'pick_up_now' | 'watch' | 'hold' | 'drop_candidate';

function computeSignal(player: {
  add_count_24h: number;
  add_count_prev_24h: number;
  ownership_pct: number;
  injury_status: string | null;
}): { signal: TrendSignal; recommendation: Recommendation } {
  const delta = player.add_count_24h - player.add_count_prev_24h;
  const pctChange = delta / (player.add_count_prev_24h || 1);
  if (pctChange > 1.5 && player.ownership_pct < 60) return { signal: 'hot', recommendation: 'pick_up_now' };
  if (pctChange > 0.5) return { signal: 'rising', recommendation: 'watch' };
  if (pctChange < -0.5) return { signal: 'cooling', recommendation: 'hold' };
  return { signal: 'neutral', recommendation: 'hold' };
}
```

---

## Page Structure

### `/` — Home
- Sport tabs: NFL | NBA | MLB
- Top trending players for active/upcoming sport (ISR, 1h refresh)
- Pickup trend sparklines for top 10 players
- "Last updated: X minutes ago" timestamp
- Position quick-filter buttons
- Injury alerts strip (players newly injured or returning)
- Schema.org: `WebSite`, `ItemList`, `FAQPage`
- ISR revalidate: 3600s

### `/sports/[sport]`
- Sport-specific trending page: NFL, NBA, MLB
- Tabs: Trending Now | Top Adds (24h) | Top Drops (24h) | Injuries
- Full sorted table with trend %, ownership %, signal badge, recommendation badge
- Position filter sidebar
- News feed for sport
- Schema.org: `ItemList`, `SportsEvent`
- ISR revalidate: 3600s

### `/positions/[pos]`
- e.g., `/positions/qb`, `/positions/rb`, `/positions/wr`, `/positions/pg`
- Position-specific trending table
- Top adds, top drops for this position
- Position scarcity indicator ("QB Streamers: Good Week")
- Schema.org: `ItemList`
- ISR revalidate: 3600s

### `/players/[sport]/[slug]`
- e.g., `/players/nfl/jordan-addison-wr-min`
- Player header: name, position, team, headshot, injury status badge
- Trend chart: pickup % last 7 days (sparkline → full chart)
- Recommendation badge: "Pick Up Now" / "Watch" / "Hold"
- Season stats table (static from weekly update)
- Recent news (last 3 news items from ESPN feed)
- Depth chart position on team
- Related players (same team, same position) sidebar
- Schema.org: `Person`, `SportsEvent`
- ISR revalidate: 3600s

### `/teams/[sport]/[slug]`
- e.g., `/teams/nfl/minnesota-vikings`
- Team roster: starters + backups, ownership %, trend signal
- Current injuries on team
- Opportunity ratings (carries, targets, snaps)
- "Handcuff" recommendations
- Schema.org: `SportsTeam`, `ItemList`
- ISR revalidate: 3600s

### `/blog/[slug]` — SEO content
- Seed articles: "2025 Fantasy Waiver Wire: Week 1 Adds", "Best streaming RBs this week"
- Schema.org: `Article`

### `/sitemap.xml`, `/robots.txt`

---

## UI/UX Design

### Color Palette (Soft Pastel)
```
Background:     #F8F5FF  (soft cool lavender — sports/energy vibe)
Surface:        #FFFFFF
Surface-alt:    #F0FFF8  (mint for positive trend cards)
Primary:        #5B4FCF  (bold purple)
Signal-hot:     #EF4444  (red — trending fast)
Signal-rising:  #F59E0B  (amber — going up)
Signal-watch:   #3B82F6  (blue — worth watching)
Signal-neutral: #9CA3AF  (gray — nothing happening)
Pick-up-now:    #10B981  (green badge)
Drop:           #EF4444  (red badge)
Text-primary:   #1F1A3A
Text-muted:     #6B7280
Border:         #EDE9FE
```

### Layout
- Mobile-first, sport tab bar at top (persistent)
- Home: trending card list (vertical on mobile, grid on desktop)
- Player page: header card → trend chart → stats → news → related
- Tables: horizontal scroll on mobile, full on desktop
- Footer: visitor counter, sport season status, disclaimer

### Key Components
- `TrendingCard` — player name, pos/team, signal badge, pickup %, sparkline
- `SignalBadge` — Hot / Rising / Watch / Neutral (color-coded pill)
- `RecommendationBadge` — "Pick Up Now" / "Watch" / "Hold" / "Drop"
- `TrendSparkline` — 7-day pickup % mini chart
- `InjuryStatusBadge` — Out / Doubtful / Questionable / Probable / Active
- `SportTabBar` — sticky tabs for NFL / NBA / MLB
- `PositionFilter` — horizontal pill buttons for position filter
- `NewsCard` — player news item with source, date, summary
- `AdSlot` — Adsterra placeholders

### Adsterra Ad Placeholders
```html
<!-- Social Bar (sticky mobile) -->
<div id="adsterra-social-bar" data-ad="social-bar" class="adsterra-social-bar"></div>

<!-- Native Banner (between trending list sections) -->
<div id="adsterra-native" data-ad="native-banner" class="my-6 adsterra-native"></div>

<!-- Display Banner (sidebar desktop / below table mobile) -->
<div id="adsterra-banner" data-ad="display-banner" class="adsterra-banner"></div>
```

---

## i18n (Internationalization)

**Languages:** en (default), ko, ja, zh, es, fr, de, pt

**Implementation:**
- `next-i18next` with locale routing
- URL: `/` (en), `/ko/`, `/ja/`, etc.
- Player names / team names remain in English (global standard)
- UI labels, badge text, nav labels, chart labels, SEO meta per locale
- Sport terminology translated (e.g., "waiver" → locale equivalent)
- `hreflang` on all pages

**Translation namespaces:** `common.json`, `sports.json`, `positions.json`, `recommendations.json`, `seo.json`

---

## Google Sheets Webhook

**Events logged:**
- Home page view (sport tab active, time of day)
- Player page view (player slug, sport, position)
- Sport page view
- Position page view
- Team page view
- Recommendation badge visible (impressions)

```typescript
// lib/webhook.ts
export async function logEvent(event: {
  type: string;
  data: Record<string, unknown>;
}) {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) return;
  try {
    await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        ts: new Date().toISOString(),
        project: 'fantasy-waiver-radar',
      }),
    });
  } catch { /* non-blocking */ }
}
```

---

## Visitor Counter

- Vercel KV (free tier)
- `POST /api/visitors` on page load (non-blocking)
- Footer: `Visitors today: 512  |  Total: 83,241` — small muted text

```typescript
// app/api/visitors/route.ts
import { kv } from '@vercel/kv';
export async function POST() {
  const today = new Date().toISOString().slice(0, 10);
  const [total, todayCount] = await Promise.all([
    kv.incr('visitors:total'),
    kv.incr(`visitors:${today}`),
  ]);
  return Response.json({ total, today: todayCount });
}
```

---

## SEO Requirements

- Title template: "Fantasy Waiver Wire Trending Players — [Sport] Week [N] (2025)"
- Title template: "[Player Name] Fantasy Waiver Wire Analysis — Pick Up or Drop?"
- Description: "[Player] trending +X% on waivers. [Recommendation]. See stats, injury status, recent news."
- `next-sitemap` with all player, sport, position, team pages
- JSON-LD: `Person`, `SportsTeam`, `ItemList`, `FAQPage`, `Article`
- Canonical + `hreflang` x8
- OG images: dynamic via `@vercel/og` — player name, signal badge, recommendation
- Internal links: home → sport → position → player → team
- URL target keywords: "fantasy waiver wire", "[player name] fantasy", "[position] streamers"

---

## Milestones & Git Commits

### Milestone 1 — Scaffold + Static Data
- Init Next.js 14, Tailwind, TypeScript, Zustand
- Seed player data from Sleeper bulk player endpoint → `data/players/nfl.json`, `nba.json`, `mlb.json`
- Create `data/teams/`, `data/injuries/` base files
- Railway cron service skeleton
- Harness files
- **Git:** `git commit -m "feat: scaffold, seeded player data for NFL/NBA/MLB"`
- **GitHub:** `gh repo create taeshin11/fantasy-waiver-radar --public --source=. --push`

### Milestone 2 — Cron + Data Layer
- Sleeper trending API cron jobs (NFL, NBA, MLB)
- ESPN news cron job
- Redis caching layer
- Next.js API routes: `/api/trending/[sport]`, `/api/players/[sport]/[slug]`
- Trend signal computation logic
- **Git:** `git commit -m "feat: cron jobs, Redis cache, API routes, trend signals"`
- **Push:** `git push`

### Milestone 3 — Core Pages
- Home page with sport tabs
- `/sports/[sport]` pages
- `/positions/[pos]` pages
- All schema.org, next-seo, ISR
- **Git:** `git commit -m "feat: home, sport pages, position pages"`
- **Push:** `git push`

### Milestone 4 — Player + Team Pages + Charts
- `/players/[sport]/[slug]` pages with trend chart
- `/teams/[sport]/[slug]` pages
- Chart.js trend sparklines and full charts
- News card component
- **Git:** `git commit -m "feat: player pages, team pages, trend charts"`
- **Push:** `git push`

### Milestone 5 — i18n + SEO
- All 8 locale files
- Sitemap, robots.txt, OG images
- Blog with 5 seed articles (Week 1 waiver wire recommendations)
- **Git:** `git commit -m "feat: i18n 8 langs, sitemap, OG images, blog"`
- **Push:** `git push`

### Milestone 6 — Ads + Webhook + Counter
- Adsterra placeholders in layout
- Google Sheets webhook
- Visitor counter
- **Git:** `git commit -m "feat: ads, webhook, visitor counter"`
- **Push:** `git push`

### Milestone 7 — Deploy
- `npx vercel --prod`
- Railway cron service deploy
- Lighthouse audit (target 90+ performance)
- Validate all ISR pages
- `research_history/milestone-7-deploy.md`
- **Git:** `git commit -m "chore: production deploy, QA"`
- **Push:** `git push`

---

## File Structure

```
fantasy-waiver-radar/
├── PRD.md
├── init.sh
├── feature_list.json
├── claude-progress.txt
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── next-sitemap.config.js
├── .env.local
├── .env.example
├── research_history/
├── data/
│   ├── players/
│   │   ├── nfl.json          # All NFL players (from Sleeper bulk)
│   │   ├── nba.json
│   │   └── mlb.json
│   ├── teams/
│   │   ├── nfl.json
│   │   ├── nba.json
│   │   └── mlb.json
│   └── injuries/
│       ├── nfl.json
│       ├── nba.json
│       └── mlb.json
├── cron-service/
│   ├── index.ts
│   ├── jobs/
│   │   ├── fetch-sleeper-nfl.ts
│   │   ├── fetch-sleeper-nba.ts
│   │   ├── fetch-sleeper-mlb.ts
│   │   ├── fetch-espn-news.ts
│   │   └── store-redis.ts
│   ├── package.json
│   └── Dockerfile
├── content/blog/
├── public/
│   ├── locales/{en,ko,ja,zh,es,fr,de,pt}/
│   └── robots.txt
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── sports/[sport]/page.tsx
    │   ├── positions/[pos]/page.tsx
    │   ├── players/[sport]/[slug]/page.tsx
    │   ├── teams/[sport]/[slug]/page.tsx
    │   ├── blog/[slug]/page.tsx
    │   └── api/
    │       ├── trending/[sport]/route.ts
    │       ├── players/[sport]/[slug]/route.ts
    │       └── visitors/route.ts
    ├── components/
    │   ├── layout/ Navbar.tsx Footer.tsx AdSlot.tsx SportTabBar.tsx
    │   ├── players/ TrendingCard.tsx PlayerHeader.tsx NewsCard.tsx
    │   ├── badges/ SignalBadge.tsx RecommendationBadge.tsx InjuryStatusBadge.tsx
    │   ├── filters/ PositionFilter.tsx SportFilter.tsx
    │   └── charts/ TrendSparkline.tsx TrendFullChart.tsx
    ├── lib/
    │   ├── redis.ts
    │   ├── trends.ts      # Trend signal computation
    │   ├── webhook.ts
    │   ├── visitors.ts
    │   └── seo.ts
    ├── store/
    │   └── useStore.ts    # Sport/position filter state
    └── types/index.ts
```

---

## Harness Spec

### `feature_list.json`
```json
{
  "project": "fantasy-waiver-radar",
  "version": "1.0.0",
  "features": [
    { "id": "player-seed-data", "status": "pending", "milestone": 1 },
    { "id": "cron-sleeper-nfl", "status": "pending", "milestone": 2 },
    { "id": "cron-sleeper-nba", "status": "pending", "milestone": 2 },
    { "id": "cron-sleeper-mlb", "status": "pending", "milestone": 2 },
    { "id": "cron-espn-news", "status": "pending", "milestone": 2 },
    { "id": "redis-cache", "status": "pending", "milestone": 2 },
    { "id": "trend-signal-logic", "status": "pending", "milestone": 2 },
    { "id": "home-page", "status": "pending", "milestone": 3 },
    { "id": "sport-pages", "status": "pending", "milestone": 3 },
    { "id": "position-pages", "status": "pending", "milestone": 3 },
    { "id": "player-pages", "status": "pending", "milestone": 4 },
    { "id": "team-pages", "status": "pending", "milestone": 4 },
    { "id": "trend-charts", "status": "pending", "milestone": 4 },
    { "id": "i18n-8langs", "status": "pending", "milestone": 5 },
    { "id": "seo-sitemap", "status": "pending", "milestone": 5 },
    { "id": "blog-articles", "status": "pending", "milestone": 5 },
    { "id": "ads-adsterra", "status": "pending", "milestone": 6 },
    { "id": "webhook-sheets", "status": "pending", "milestone": 6 },
    { "id": "visitor-counter", "status": "pending", "milestone": 6 },
    { "id": "vercel-deploy", "status": "pending", "milestone": 7 },
    { "id": "railway-cron-deploy", "status": "pending", "milestone": 7 }
  ]
}
```

### `claude-progress.txt`
```
CURRENT_MILESTONE=1
LAST_COMMIT=none
LAST_PUSH=none
NEXT_ACTION=Run init.sh to scaffold project
BLOCKER=none
```

### `init.sh`
```bash
#!/usr/bin/env bash
set -e
echo "=== FantasyWaiverRadar Init ==="
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
npm install next-i18next next-seo next-sitemap chart.js react-chartjs-2 zustand ioredis @vercel/kv
npm install -D @types/node
mkdir -p data/{players,teams,injuries} cron-service/jobs content/blog research_history \
  public/locales/{en,ko,ja,zh,es,fr,de,pt} \
  src/components/{layout,players,badges,filters,charts} src/lib src/store src/types

# Seed player data from Sleeper (runs once at init)
echo "Fetching Sleeper player data..."
curl -s "https://api.sleeper.app/v1/players/nfl" -o data/players/nfl-raw.json
curl -s "https://api.sleeper.app/v1/players/nba" -o data/players/nba-raw.json
echo "Player data fetched. Process with scripts to extract needed fields."

cp .env.example .env.local
echo "Init complete. Update .env.local with your Redis URL from Railway."
git add -A && git commit -m "feat: project scaffold, seeded player data"
gh repo create taeshin11/fantasy-waiver-radar --public --source=. --push
echo "GitHub repo created and pushed."
```
