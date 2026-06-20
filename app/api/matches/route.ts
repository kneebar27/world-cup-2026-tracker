import { NextResponse } from "next/server";
import { fetchFromApi, type Match, type ApiResult } from "@/lib/football";
import { SAMPLE_MATCHES } from "@/lib/sampleData";

export const revalidate = 60; // cache this route for 60s

interface RawMatches {
  matches: any[];
}

export async function GET() {
  try {
    const raw = await fetchFromApi<RawMatches>("/competitions/WC/matches");
    const matches: Match[] = (raw.matches || []).map((m: any) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      stage: m.stage,
      group: m.group ?? null,
      homeTeam: {
        name: m.homeTeam?.name ?? null,
        tla: m.homeTeam?.tla ?? "",
        crest: m.homeTeam?.crest ?? "",
      },
      awayTeam: {
        name: m.awayTeam?.name ?? null,
        tla: m.awayTeam?.tla ?? "",
        crest: m.awayTeam?.crest ?? "",
      },
      score: {
        winner: m.score?.winner ?? null,
        fullTime: {
          home: m.score?.fullTime?.home ?? null,
          away: m.score?.fullTime?.away ?? null,
        },
      },
    }));

    const payload: ApiResult<Match[]> = {
      sample: matches.length === 0,
      updated: new Date().toISOString(),
      data: matches.length ? matches : SAMPLE_MATCHES,
    };
    return NextResponse.json(payload);
  } catch (e) {
    const payload: ApiResult<Match[]> = {
      sample: true,
      updated: new Date().toISOString(),
      data: SAMPLE_MATCHES,
    };
    return NextResponse.json(payload);
  }
}
