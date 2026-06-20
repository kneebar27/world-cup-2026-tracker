import { NextResponse } from "next/server";
import {
  buildGroupStandingsFromMatches,
  fetchFromApi,
  type ApiResult,
  type Group,
} from "@/lib/football";
import { SAMPLE_GROUPS } from "@/lib/sampleData";

export const revalidate = 60; // cache this route for 60s

interface RawMatches {
  matches: any[];
}

export async function GET() {
  try {
    const raw = await fetchFromApi<RawMatches>("/competitions/WC/matches");
    const groups = buildGroupStandingsFromMatches(raw.matches || []);

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
