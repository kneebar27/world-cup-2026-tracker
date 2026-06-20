import { NextResponse } from "next/server";
import { fetchFromApi, type Group, type ApiResult } from "@/lib/football";
import { SAMPLE_GROUPS } from "@/lib/sampleData";

export const revalidate = 60; // cache this route for 60s

interface RawStandings {
  standings: Array<{
    stage: string;
    type: string; // TOTAL | HOME | AWAY
    group: string | null; // "GROUP_A"
    table: any[];
  }>;
}

function prettyGroup(g: string | null): string {
  if (!g) return "Group";
  return g
    .replace("GROUP_", "Group ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  try {
    const raw = await fetchFromApi<RawStandings>("/competitions/WC/standings");
    const groups: Group[] = (raw.standings || [])
      .filter((s) => s.type === "TOTAL" && s.group)
      .map((s) => ({
        group: prettyGroup(s.group),
        table: (s.table || []).map((r: any) => ({
          position: r.position,
          team: {
            id: r.team?.id ?? 0,
            name: r.team?.name ?? "TBD",
            tla: r.team?.tla ?? "",
            crest: r.team?.crest ?? "",
          },
          playedGames: r.playedGames ?? 0,
          won: r.won ?? 0,
          draw: r.draw ?? 0,
          lost: r.lost ?? 0,
          points: r.points ?? 0,
          goalsFor: r.goalsFor ?? 0,
          goalsAgainst: r.goalsAgainst ?? 0,
          goalDifference: r.goalDifference ?? 0,
        })),
      }));

    const payload: ApiResult<Group[]> = {
      sample: groups.length === 0,
      updated: new Date().toISOString(),
      data: groups.length ? groups : SAMPLE_GROUPS,
    };
    return NextResponse.json(payload);
  } catch (e) {
    const payload: ApiResult<Group[]> = {
      sample: true,
      updated: new Date().toISOString(),
      data: SAMPLE_GROUPS,
    };
    return NextResponse.json(payload);
  }
}
