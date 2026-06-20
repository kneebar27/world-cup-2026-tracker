// Shared types + helpers for the 2026 World Cup tracker.
// All calls to football-data.org happen server-side (in /app/api/*) so the
// API token is never exposed to the browser.

export const COMPETITION = "WC"; // FIFA World Cup competition code on football-data.org
export const API_BASE = "https://api.football-data.org/v4";

// US broadcaster tag. Exact split (FOX vs FS1) varies per match.
export const BROADCASTERS = "FOX / FS1";

export interface Team {
  id: number;
  name: string;
  tla: string; // three-letter abbreviation, e.g. "BRA"
  crest: string; // flag/crest image URL
}

export interface TableRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Group {
  group: string; // "Group A"
  table: TableRow[];
}

export interface Match {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | etc.
  stage: string; // GROUP_STAGE | LAST_32 | LAST_16 | QUARTER_FINALS | SEMI_FINALS | THIRD_PLACE | FINAL
  group: string | null;
  homeTeam: Partial<Team> & { name: string | null };
  awayTeam: Partial<Team> & { name: string | null };
  score: {
    winner: string | null; // HOME_TEAM | AWAY_TEAM | DRAW | null
    fullTime: { home: number | null; away: number | null };
  };
}

export interface ApiResult<T> {
  sample: boolean; // true when no token is configured / upstream failed
  updated: string; // ISO timestamp of when this payload was assembled
  data: T;
}

// ---- Pacific-time formatting (auto-handles PST vs PDT) ----

export function formatPacific(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short", // "PST" or "PDT"
  }).format(d);
  return { day, time };
}

// "YYYY-MM-DD" for the given instant in U.S. Pacific time.
export function pacificDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function todayPacificKey(): string {
  return pacificDateKey(new Date().toISOString());
}

// ---- Qualification scenario tracker (group stage) ----

export type QualStatus = "qualified" | "contention" | "eliminated";
export interface TeamScenario {
  status: QualStatus;
  note: string;
}

export const QUAL_LABELS: Record<QualStatus, string> = {
  qualified: "Through (top 2)",
  contention: "In contention",
  eliminated: "Eliminated",
};

// At-a-glance guide (not an official ruling). Each team plays `gamesPerTeam`
// group games; top two of each group advance directly, the best eight
// third-placed teams also go through.
export function analyzeGroup(
  table: TableRow[],
  gamesPerTeam = 3
): Record<string, TeamScenario> {
  const info = table.map((r) => {
    const remaining = Math.max(0, gamesPerTeam - r.playedGames);
    return {
      name: r.team.name,
      pts: r.points,
      max: r.points + 3 * remaining,
      remaining,
    };
  });

  const out: Record<string, TeamScenario> = {};
  info.forEach((t) => {
    const others = info.filter((o) => o.name !== t.name);
    // How many others can still reach or pass the team's current points.
    const canReachNow = others.filter((o) => o.max >= t.pts).length;
    // How many others are already beyond the team's best possible total.
    const aboveMax = others.filter((o) => o.pts > t.max).length;

    if (canReachNow <= 1) {
      out[t.name] = {
        status: "qualified",
        note: "Clinched a top-2 spot — through to the knockouts.",
      };
    } else if (aboveMax >= 2) {
      out[t.name] = {
        status: "eliminated",
        note: "Can no longer reach the top two of the group.",
      };
    } else if (t.remaining === 0) {
      out[t.name] = {
        status: "contention",
        note: "Group games done — waiting to see if it sneaks in as a best third-place team.",
      };
    } else {
      const afterWin = t.pts + 3;
      const threatsAfterWin = others.filter((o) => o.max > afterWin).length;
      const g = `${t.remaining} game${t.remaining > 1 ? "s" : ""} left`;
      out[t.name] = {
        status: "contention",
        note:
          threatsAfterWin <= 1
            ? `Win the next match and a top-2 place is all but secured (${g}).`
            : `Still alive (${g}) — needs wins and favorable results elsewhere.`,
      };
    }
  });
  return out;
}

export const KNOCKOUT_STAGES = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarterfinals",
  SEMI_FINALS: "Semifinals",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

export function isLive(status: string): boolean {
  return status === "IN_PLAY" || status === "PAUSED";
}

export function isUpcoming(status: string): boolean {
  return status === "SCHEDULED" || status === "TIMED";
}

export function formatGroupName(g: string | null): string {
  if (!g) return "Group";
  return g
    .replace("GROUP_", "Group ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Build tables from finished group matches only. The /standings endpoint can
// treat in-progress games as draws; match results stay accurate on native-stats.
export function buildGroupStandingsFromMatches(rawMatches: any[]): Group[] {
  type RowMap = Map<number, TableRow>;
  const groups = new Map<string, RowMap>();

  const ensureGroup = (label: string): RowMap => {
    let rows = groups.get(label);
    if (!rows) {
      rows = new Map();
      groups.set(label, rows);
    }
    return rows;
  };

  const ensureRow = (rows: RowMap, team: any): TableRow => {
    const id = team?.id ?? 0;
    let row = rows.get(id);
    if (!row) {
      row = {
        position: 0,
        team: {
          id,
          name: team?.name ?? "TBD",
          tla: team?.tla ?? "",
          crest: team?.crest ?? "",
        },
        playedGames: 0,
        won: 0,
        draw: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      };
      rows.set(id, row);
    }
    return row;
  };

  for (const m of rawMatches) {
    if (m.stage !== "GROUP_STAGE" || !m.group) continue;
    const label = formatGroupName(m.group);
    const rows = ensureGroup(label);
    ensureRow(rows, m.homeTeam);
    ensureRow(rows, m.awayTeam);
  }

  for (const m of rawMatches) {
    if (m.stage !== "GROUP_STAGE" || !m.group) continue;
    if (m.status !== "FINISHED" && m.status !== "AWARDED") continue;

    const homeGoals = m.score?.fullTime?.home;
    const awayGoals = m.score?.fullTime?.away;
    if (homeGoals == null || awayGoals == null) continue;

    const rows = ensureGroup(formatGroupName(m.group));
    const home = ensureRow(rows, m.homeTeam);
    const away = ensureRow(rows, m.awayTeam);

    home.playedGames++;
    away.playedGames++;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (homeGoals < awayGoals) {
      home.lost++;
      away.won++;
      away.points += 3;
    } else {
      home.draw++;
      away.draw++;
      home.points++;
      away.points++;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, rows]) => {
      const table = [...rows.values()].sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor
      );
      table.forEach((row, i) => {
        row.position = i + 1;
      });
      return { group, table };
    });
}

// Server-side fetch with the secret token. Cached by the route handler.
export async function fetchFromApi<T>(path: string): Promise<T> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("NO_TOKEN");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Auth-Token": token },
    // Revalidate at most once per 60s to stay well under the free 10 req/min limit.
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json() as Promise<T>;
}
