// Sample/placeholder data shown ONLY when no API token is configured.
// Lets you preview the full UI in Cursor before wiring up the live key.
// Flags come from flagcdn.com. Once your token is set, real live data replaces all of this.

import type { Group, Match, TableRow, Team } from "./football";

const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`;

let _id = 1;
function team(name: string, code: string, tla: string): Team {
  return { id: _id++, name, tla, crest: flag(code) };
}

// [name, flagcode, tla, played, won, draw, lost, gf, ga]
type Row = [string, string, string, number, number, number, number, number, number];

function buildGroup(label: string, rows: Row[]): Group {
  const table: TableRow[] = rows.map((r) => {
    const [name, code, tla, p, w, d, l, gf, ga] = r;
    return {
      position: 0,
      team: team(name, code, tla),
      playedGames: p,
      won: w,
      draw: d,
      lost: l,
      points: w * 3 + d,
      goalsFor: gf,
      goalsAgainst: ga,
      goalDifference: gf - ga,
    };
  });
  table.sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
  );
  table.forEach((t, i) => (t.position = i + 1));
  return { group: label, table };
}

export const SAMPLE_GROUPS: Group[] = [
  buildGroup("Group A", [
    ["Mexico", "mx", "MEX", 2, 2, 0, 0, 4, 1],
    ["South Korea", "kr", "KOR", 2, 1, 0, 1, 3, 3],
    ["South Africa", "za", "RSA", 2, 0, 1, 1, 2, 3],
    ["Ukraine", "ua", "UKR", 2, 0, 1, 1, 1, 3],
  ]),
  buildGroup("Group B", [
    ["Canada", "ca", "CAN", 2, 1, 1, 0, 3, 1],
    ["Switzerland", "ch", "SUI", 2, 1, 1, 0, 2, 0],
    ["Qatar", "qa", "QAT", 2, 0, 1, 1, 1, 3],
    ["Wales", "gb-wls", "WAL", 2, 0, 1, 1, 1, 3],
  ]),
  buildGroup("Group C", [
    ["Brazil", "br", "BRA", 2, 2, 0, 0, 5, 1],
    ["Morocco", "ma", "MAR", 2, 1, 0, 1, 2, 2],
    ["Japan", "jp", "JPN", 2, 1, 0, 1, 2, 2],
    ["Costa Rica", "cr", "CRC", 2, 0, 0, 2, 0, 4],
  ]),
  buildGroup("Group D", [
    ["United States", "us", "USA", 2, 2, 0, 0, 4, 1],
    ["Italy", "it", "ITA", 2, 1, 0, 1, 3, 2],
    ["Australia", "au", "AUS", 2, 1, 0, 1, 2, 2],
    ["Paraguay", "py", "PAR", 2, 0, 0, 2, 1, 5],
  ]),
  buildGroup("Group E", [
    ["Germany", "de", "GER", 2, 2, 0, 0, 5, 2],
    ["Ecuador", "ec", "ECU", 2, 1, 0, 1, 2, 1],
    ["Tunisia", "tn", "TUN", 2, 0, 1, 1, 1, 3],
    ["New Zealand", "nz", "NZL", 2, 0, 1, 1, 1, 3],
  ]),
  buildGroup("Group F", [
    ["Netherlands", "nl", "NED", 2, 1, 1, 0, 4, 2],
    ["Egypt", "eg", "EGY", 2, 1, 1, 0, 2, 1],
    ["Iran", "ir", "IRN", 2, 0, 1, 1, 1, 2],
    ["Honduras", "hn", "HON", 2, 0, 1, 1, 1, 3],
  ]),
  buildGroup("Group G", [
    ["Belgium", "be", "BEL", 2, 2, 0, 0, 4, 1],
    ["Sweden", "se", "SWE", 2, 1, 0, 1, 3, 2],
    ["Ivory Coast", "ci", "CIV", 2, 1, 0, 1, 2, 2],
    ["Haiti", "ht", "HAI", 2, 0, 0, 2, 0, 4],
  ]),
  buildGroup("Group H", [
    ["Spain", "es", "ESP", 2, 2, 0, 0, 5, 1],
    ["Uruguay", "uy", "URU", 2, 1, 0, 1, 3, 2],
    ["Cape Verde", "cv", "CPV", 2, 0, 1, 1, 1, 3],
    ["Saudi Arabia", "sa", "KSA", 2, 0, 1, 1, 1, 4],
  ]),
  buildGroup("Group I", [
    ["France", "fr", "FRA", 2, 2, 0, 0, 4, 0],
    ["Norway", "no", "NOR", 2, 1, 0, 1, 3, 2],
    ["Senegal", "sn", "SEN", 2, 1, 0, 1, 2, 2],
    ["Iraq", "iq", "IRQ", 2, 0, 0, 2, 0, 5],
  ]),
  buildGroup("Group J", [
    ["Argentina", "ar", "ARG", 2, 2, 0, 0, 5, 1],
    ["Austria", "at", "AUT", 2, 1, 0, 1, 2, 2],
    ["Algeria", "dz", "ALG", 2, 1, 0, 1, 2, 2],
    ["Jordan", "jo", "JOR", 2, 0, 0, 2, 1, 5],
  ]),
  buildGroup("Group K", [
    ["Portugal", "pt", "POR", 2, 2, 0, 0, 4, 1],
    ["Colombia", "co", "COL", 2, 1, 1, 0, 3, 1],
    ["Uzbekistan", "uz", "UZB", 2, 0, 1, 1, 1, 3],
    ["DR Congo", "cd", "COD", 2, 0, 0, 2, 1, 4],
  ]),
  buildGroup("Group L", [
    ["England", "gb-eng", "ENG", 2, 2, 0, 0, 4, 0],
    ["Croatia", "hr", "CRO", 2, 1, 0, 1, 3, 2],
    ["Ghana", "gh", "GHA", 2, 1, 0, 1, 2, 2],
    ["Panama", "pa", "PAN", 2, 0, 0, 2, 1, 6],
  ]),
];

function mt(
  homeName: string,
  homeCode: string,
  awayName: string,
  awayCode: string,
  hoursFromNow: number,
  stage: string,
  group: string | null,
  finished: boolean,
  hg = 0,
  ag = 0
): Match {
  const utc = new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString();
  return {
    id: _id++,
    utcDate: utc,
    status: finished ? "FINISHED" : "TIMED",
    stage,
    group,
    homeTeam: { name: homeName, tla: homeCode.toUpperCase(), crest: flag(homeCode) },
    awayTeam: { name: awayName, tla: awayCode.toUpperCase(), crest: flag(awayCode) },
    score: {
      winner: finished ? (hg > ag ? "HOME_TEAM" : ag > hg ? "AWAY_TEAM" : "DRAW") : null,
      fullTime: { home: finished ? hg : null, away: finished ? ag : null },
    },
  };
}

export const SAMPLE_MATCHES: Match[] = [
  // Upcoming group games
  mt("Mexico", "mx", "Ukraine", "ua", 3, "GROUP_STAGE", "Group A", false),
  mt("United States", "us", "Italy", "it", 5, "GROUP_STAGE", "Group D", false),
  mt("Brazil", "br", "Japan", "jp", 27, "GROUP_STAGE", "Group C", false),
  mt("England", "gb-eng", "Croatia", "hr", 29, "GROUP_STAGE", "Group L", false),
  mt("Argentina", "ar", "Austria", "at", 51, "GROUP_STAGE", "Group J", false),
  mt("France", "fr", "Norway", "no", 53, "GROUP_STAGE", "Group I", false),
  // Recent finished group games
  mt("Spain", "es", "Saudi Arabia", "sa", -20, "GROUP_STAGE", "Group H", true, 3, 0),
  mt("Germany", "de", "New Zealand", "nz", -22, "GROUP_STAGE", "Group E", true, 2, 1),
  // Knockout placeholders (winners TBD until group stage ends)
  mt("Winner Group A", "un", "Runner-up Group B", "un", 240, "LAST_32", null, false),
  mt("Winner Group C", "un", "Runner-up Group D", "un", 246, "LAST_32", null, false),
  mt("Winner Group E", "un", "Runner-up Group F", "un", 264, "LAST_32", null, false),
  mt("Winner Group G", "un", "Runner-up Group H", "un", 270, "LAST_32", null, false),
];
