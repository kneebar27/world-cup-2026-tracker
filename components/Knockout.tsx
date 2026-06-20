"use client";

import {
  BROADCASTERS,
  formatPacific,
  isLive,
  isUpcoming,
  KNOCKOUT_STAGES,
  STAGE_LABELS,
  type Match,
} from "@/lib/football";
import { Flag, StatusRow, useAutoData } from "./ui";
import MatchCard from "./MatchCard";

export default function Knockout() {
  const matches = useAutoData<Match[]>("/api/matches");
  const all = matches.payload?.data ?? [];
  const sample = matches.payload?.sample ?? true;

  const knockout = all.filter((m) => KNOCKOUT_STAGES.includes(m.stage as any));

  const upcoming = knockout
    .filter((m) => isUpcoming(m.status) || isLive(m.status))
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate))
    .slice(0, 8);

  return (
    <main className="wrap">
      <section className="hero">
        <h1>
          Knockout <span className="grad">Bracket</span>
        </h1>
        <p>
          Win or go home. Follow every tie from the Round of 32 to the Final at
          MetLife Stadium.
        </p>
      </section>

      <StatusRow sample={sample} updated={matches.payload?.updated} />

      <div className="section-title">Bracket</div>
      {knockout.length === 0 ? (
        <div className="empty">
          The bracket fills in automatically once the group stage finishes.
        </div>
      ) : (
        <div className="bracket-scroll">
          <div className="bracket">
            {KNOCKOUT_STAGES.map((stage) => {
              const ties = knockout
                .filter((m) => m.stage === stage)
                .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));
              if (ties.length === 0) return null;
              return (
                <div className="round" key={stage}>
                  <div className="round-head">{STAGE_LABELS[stage]}</div>
                  {ties.map((m) => (
                    <Tie key={m.id} m={m} isFinal={stage === "FINAL"} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="section-title">Upcoming & Live Matches</div>
      {upcoming.length === 0 ? (
        <div className="empty">No knockout matches scheduled yet.</div>
      ) : (
        <div className="fixtures">
          {upcoming.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
      )}

      <div className="footer">
        Times shown in U.S. Pacific (PT). Matches air on FOX / FS1; exact
        channel can vary per match. Scores via football-data.org, refreshed
        automatically.
      </div>
    </main>
  );
}

function Tie({ m, isFinal }: { m: Match; isFinal: boolean }) {
  const finished = m.status === "FINISHED";
  const live = isLive(m.status);
  const played = finished || live;
  const hw = m.score.winner === "HOME_TEAM";
  const aw = m.score.winner === "AWAY_TEAM";
  const { day, time } = formatPacific(m.utcDate);

  return (
    <div className={"tie" + (isFinal ? " final-tie" : "")}>
      <div
        className={
          "tie-row" +
          (finished && hw ? " winner" : "") +
          (finished && aw ? " loser" : "")
        }
      >
        <Flag src={m.homeTeam.crest} alt={m.homeTeam.tla || m.homeTeam.name || "TBD"} />
        <span className="nm">{m.homeTeam.name || "TBD"}</span>
        {played && <span className="g">{m.score.fullTime.home ?? 0}</span>}
      </div>
      <div
        className={
          "tie-row" +
          (finished && aw ? " winner" : "") +
          (finished && hw ? " loser" : "")
        }
      >
        <Flag src={m.awayTeam.crest} alt={m.awayTeam.tla || m.awayTeam.name || "TBD"} />
        <span className="nm">{m.awayTeam.name || "TBD"}</span>
        {played && <span className="g">{m.score.fullTime.away ?? 0}</span>}
      </div>
      <div className="tie-when">
        {live ? (
          <span className="livebadge">● LIVE</span>
        ) : finished ? (
          <span>Full time</span>
        ) : (
          <>
            <span>{day}</span>
            <span>{time}</span>
          </>
        )}
      </div>
    </div>
  );
}
