"use client";

import {
  BROADCASTERS,
  formatPacific,
  isLive,
  STAGE_LABELS,
  type Match,
} from "@/lib/football";
import { Flag } from "./ui";

export default function MatchCard({ m }: { m: Match }) {
  const live = isLive(m.status);
  const finished = m.status === "FINISHED";
  const { day, time } = formatPacific(m.utcDate);
  const hw = m.score.winner === "HOME_TEAM";
  const aw = m.score.winner === "AWAY_TEAM";

  const stageTag =
    m.stage === "GROUP_STAGE"
      ? m.group || "Group Stage"
      : STAGE_LABELS[m.stage] || m.stage;

  return (
    <div className="fixture">
      <div className="meta">
        <span className="stage-tag">{stageTag}</span>
        {live ? (
          <span className="livebadge">● LIVE</span>
        ) : finished ? (
          <span className="final-badge">FULL TIME</span>
        ) : (
          <span>{day}</span>
        )}
      </div>

      <div className="matchup">
        <div className="side home">
          <Flag src={m.homeTeam.crest} alt={m.homeTeam.tla || m.homeTeam.name || "TBD"} />
          <span className="nm">{m.homeTeam.name || "TBD"}</span>
        </div>

        {finished || live ? (
          <div className="score">
            <span className={hw ? "win" : ""}>{m.score.fullTime.home ?? 0}</span>
            <span style={{ color: "var(--muted)" }}> – </span>
            <span className={aw ? "win" : ""}>{m.score.fullTime.away ?? 0}</span>
          </div>
        ) : (
          <div className="vs">vs</div>
        )}

        <div className="side away">
          <Flag src={m.awayTeam.crest} alt={m.awayTeam.tla || m.awayTeam.name || "TBD"} />
          <span className="nm">{m.awayTeam.name || "TBD"}</span>
        </div>
      </div>

      {!finished && (
        <div className="airtime">
          <span className="when">
            {live ? "Now playing" : `${time}`}
          </span>
          <span className="tv">📺 {BROADCASTERS}</span>
        </div>
      )}
    </div>
  );
}
