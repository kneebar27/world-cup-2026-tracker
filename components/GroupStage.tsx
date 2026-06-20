"use client";

import {
  analyzeGroup,
  isLive,
  isUpcoming,
  QUAL_LABELS,
  type Group,
  type Match,
  type QualStatus,
} from "@/lib/football";
import { Flag, StatusRow, useAutoData } from "./ui";
import MatchCard from "./MatchCard";

export default function GroupStage() {
  const standings = useAutoData<Group[]>("/api/standings");
  const matches = useAutoData<Match[]>("/api/matches");

  const groups = standings.payload?.data ?? [];
  const allMatches = matches.payload?.data ?? [];
  const sample =
    (standings.payload?.sample ?? true) || (matches.payload?.sample ?? true);

  const groupMatches = allMatches.filter((m) => m.stage === "GROUP_STAGE");
  const upcoming = groupMatches
    .filter((m) => isUpcoming(m.status) || isLive(m.status))
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate))
    .slice(0, 12);
  const recent = groupMatches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => +new Date(b.utcDate) - +new Date(a.utcDate))
    .slice(0, 6);

  return (
    <main className="wrap">
      <section className="hero">
        <h1>
          Group Stage <span className="grad">Standings</span>
        </h1>
        <p>
          All 12 groups, ranked by points. Top two of each group advance, plus
          the eight best third-placed teams.
        </p>
      </section>

      <StatusRow sample={sample} updated={standings.payload?.updated} />

      <div className="section-title">Standings & Qualification</div>
      <div className="legend">
        <span className="lg-item">
          <span className="status-dot qualified" /> {QUAL_LABELS.qualified}
        </span>
        <span className="lg-item">
          <span className="status-dot contention" /> {QUAL_LABELS.contention}
        </span>
        <span className="lg-item">
          <span className="status-dot eliminated" /> {QUAL_LABELS.eliminated}
        </span>
      </div>
      {groups.length === 0 ? (
        <div className="empty">Loading standings…</div>
      ) : (
        <div className="groups">
          {groups.map((g) => {
            const scenarios = analyzeGroup(g.table);
            return (
              <div className="group-card" key={g.group}>
                <h3>{g.group}</h3>
                <table className="standings">
                  <thead>
                    <tr>
                      <th className="team">Team</th>
                      <th>P</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GD</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.table.map((r) => {
                      const st = scenarios[r.team.name]?.status ?? "contention";
                      return (
                        <tr
                          key={r.team.id + r.team.name}
                          className={r.position <= 2 ? "qualify" : ""}
                        >
                          <td className="team">
                            <div className="team-cell">
                              <span
                                className={"status-dot " + st}
                                title={QUAL_LABELS[st as QualStatus]}
                              />
                              <span className="pos">{r.position}</span>
                              <Flag
                                src={r.team.crest}
                                alt={r.team.tla || r.team.name}
                              />
                              <span className="tname">{r.team.name}</span>
                            </div>
                          </td>
                          <td>{r.playedGames}</td>
                          <td>{r.won}</td>
                          <td>{r.draw}</td>
                          <td>{r.lost}</td>
                          <td>
                            {r.goalDifference > 0 ? "+" : ""}
                            {r.goalDifference}
                          </td>
                          <td className="pts">{r.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <details className="scenarios">
                  <summary>Qualification scenarios</summary>
                  <ul>
                    {g.table.map((r) => {
                      const s = scenarios[r.team.name];
                      if (!s) return null;
                      return (
                        <li key={"sc" + r.team.id + r.team.name}>
                          <span className={"status-dot " + s.status} />
                          <span className="sc-team">{r.team.name}</span>
                          <span className="sc-note">{s.note}</span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">Upcoming & Live Matches</div>
      {upcoming.length === 0 ? (
        <div className="empty">No upcoming group matches scheduled.</div>
      ) : (
        <div className="fixtures">
          {upcoming.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <div className="section-title">Recent Results</div>
          <div className="fixtures">
            {recent.map((m) => (
              <MatchCard key={m.id} m={m} />
            ))}
          </div>
        </>
      )}

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <div className="footer">
      Times shown in U.S. Pacific (PT). Matches air on FOX / FS1; exact channel
      can vary per match. Qualification scenarios are an at-a-glance guide, not
      an official ruling. Standings & scores via football-data.org, refreshed
      automatically.
    </div>
  );
}
