"use client";

import {
  isLive,
  pacificDateKey,
  todayPacificKey,
  type Match,
} from "@/lib/football";
import { StatusRow, useAutoData } from "./ui";
import MatchCard from "./MatchCard";

export default function Today() {
  const matches = useAutoData<Match[]>("/api/matches");
  const all = matches.payload?.data ?? [];
  const sample = matches.payload?.sample ?? true;

  const today = todayPacificKey();
  const todays = all
    .filter((m) => pacificDateKey(m.utcDate) === today)
    .sort((a, b) => +new Date(a.utcDate) - +new Date(b.utcDate));

  const live = todays.filter((m) => isLive(m.status));
  const later = todays.filter((m) => !isLive(m.status));

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <main className="wrap">
      <section className="hero">
        <h1>
          Today&apos;s <span className="grad">Matches</span>
        </h1>
        <p>
          Everything kicking off today, {dateLabel} — times in Pacific, all on
          FOX / FS1.
        </p>
      </section>

      <StatusRow sample={sample} updated={matches.payload?.updated} />

      {todays.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          No World Cup matches scheduled for today. Check the{" "}
          <a href="/" style={{ color: "var(--accent-3)" }}>
            Group Stage
          </a>{" "}
          or{" "}
          <a href="/knockout" style={{ color: "var(--accent-3)" }}>
            Knockout
          </a>{" "}
          pages for what&apos;s next.
        </div>
      ) : (
        <>
          {live.length > 0 && (
            <>
              <div className="section-title">Live Now</div>
              <div className="fixtures">
                {live.map((m) => (
                  <MatchCard key={m.id} m={m} />
                ))}
              </div>
            </>
          )}
          <div className="section-title">
            {live.length > 0 ? "Also Today" : "Scheduled Today"}
          </div>
          {later.length === 0 ? (
            <div className="empty">No other matches left today.</div>
          ) : (
            <div className="fixtures">
              {later.map((m) => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="footer">
        Times shown in U.S. Pacific (PT). Matches air on FOX / FS1; exact channel
        can vary per match. Data via football-data.org, refreshed automatically.
      </div>
    </main>
  );
}
