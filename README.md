# ⚽ World Cup 2026 Live Tracker

A stylish, real-time dashboard for the 2026 FIFA World Cup — group standings,
upcoming fixtures with **Pacific air times**, and a full **knockout bracket**.
Built with Next.js so it deploys free on Vercel and works on any phone, laptop,
or TV. Share one link with your friends and you're done.

Three dashboards:

- **Today** (`/today`) — just the matches airing today (Pacific), with anything
  live pinned to the top.
- **Group Stage** (`/`) — all 12 groups ranked by points, with games played,
  W/D/L, goal difference and points, plus a **qualification scenario tracker**
  (green = through, amber = in contention, red = eliminated) with a one-line
  scenario per team. Upcoming & live matches and recent results too. Country
  flags everywhere.
- **Knockout** (`/knockout`) — bracket view from Round of 32 → Final, with
  scores, winners, and upcoming kickoff times.

All air times are U.S. Pacific and matches are tagged **FOX / FS1**.

The whole thing updates itself: every visitor gets fresh data, and open pages
auto-refresh every 60 seconds.

---

## How the live data works (and why it's free + safe)

Scores come from **[football-data.org](https://www.football-data.org/)** — free,
no credit card, and the World Cup is included on the free tier.

You get **one free token** and paste it into Vercel as an environment variable.
A tiny server route (`/app/api/*`) calls the API using that token, so:

- Your token is **never exposed** in the browser.
- Responses are cached ~60s, so even with lots of friends refreshing you stay
  well under the free limit (10 requests/min).

> Before you add a token, the site shows realistic **sample data** so you can
> preview everything. A gold "Sample data" banner appears until the live key is
> working.

---

## 1. Get your free API token

1. Go to **https://www.football-data.org/client/register**
2. Sign up with your email (free, no card).
3. Copy the **API token** they email you.

## 2. Run it locally in Cursor

```bash
npm install
cp .env.local.example .env.local
# open .env.local and paste your token after FOOTBALL_DATA_TOKEN=
npm run dev
```

Open http://localhost:3000 — you should see live standings (or sample data if
no token yet).

## 3. Push to GitHub

Create a new repo on GitHub, then from this folder:

```bash
git init
git add .
git commit -m "World Cup 2026 tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/world-cup-2026-tracker.git
git push -u origin main
```

> `.gitignore` already excludes `.env.local`, so your token is **not** uploaded.

## 4. Deploy on Vercel (free)

1. Go to **https://vercel.com**, sign in with GitHub.
2. **Add New… → Project**, import the repo.
3. Before deploying, open **Environment Variables** and add:
   - **Name:** `FOOTBALL_DATA_TOKEN`
   - **Value:** your token from step 1
4. Click **Deploy**.

Vercel gives you a free URL like `https://world-cup-2026-tracker.vercel.app`.

## 5. Share with friends

Just send them that `vercel.app` link. It works on any device, no login, no
install. **You do not need to buy a domain** — the free Vercel URL is permanent.
(You can add a custom domain later in Vercel → Settings → Domains if you ever
want a prettier name.)

---

## Customizing

- **Colors / theme:** `app/globals.css` (CSS variables at the top).
- **Broadcaster label:** `BROADCASTERS` in `lib/football.ts`.
- **Time zone:** the app formats to `America/Los_Angeles` (auto PST/PDT). Search
  for that string in `lib/football.ts` and `components/ui.tsx` to change it.
- **Refresh interval:** `useAutoData(url, 60000)` — the number is milliseconds.
- **Sample preview data:** `lib/sampleData.ts` (only shown when no token).

## Notes

- The World Cup competition code on football-data.org is `WC`.
- The free tier does not include per-player lineups/bookings — not needed here.
- Exact U.S. TV channel splits (FOX vs FS1) vary per match; the app shows a
  general broadcast tag plus the precise Pacific kickoff time.

## Tech

Next.js 14 (App Router) · React 18 · TypeScript · zero external UI libraries.
