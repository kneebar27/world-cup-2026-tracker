"use client";

import { useEffect, useState } from "react";
import type { ApiResult } from "@/lib/football";

// Flag image with graceful fallback to a neutral badge when the crest is
// missing (e.g. "TBD" knockout slots before teams are decided).
export function Flag({
  src,
  alt,
  big,
}: {
  src?: string;
  alt: string;
  big?: boolean;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span
        className={"flag" + (big ? " lg" : "")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: big ? 12 : 9,
          fontWeight: 800,
          color: "var(--muted)",
        }}
        aria-label={alt}
      >
        {alt?.slice(0, 3).toUpperCase() || "·"}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className={"flag" + (big ? " lg" : "")}
      src={src}
      alt={alt}
      onError={() => setErr(true)}
    />
  );
}

// Fetches an API route on mount, then polls every `intervalMs` so the page
// stays fresh while open. Returns the typed payload + a loading flag.
export function useAutoData<T>(url: string, intervalMs = 60000) {
  const [payload, setPayload] = useState<ApiResult<T> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = (await res.json()) as ApiResult<T>;
        if (alive) setPayload(json);
      } catch {
        /* keep last good payload */
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, intervalMs);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [url, intervalMs]);

  return { payload, loading };
}

export function StatusRow({
  sample,
  updated,
}: {
  sample: boolean;
  updated?: string;
}) {
  const time = updated
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(updated))
    : "";
  return (
    <div className="statusrow">
      {sample ? (
        <span className="pill sample">
          ⚠ Sample data — add your free API key for live results
        </span>
      ) : (
        <span className="pill">
          <span className="live" /> Live · auto-refreshes every 60s
        </span>
      )}
      {time && <span className="pill">Updated {time}</span>}
    </div>
  );
}
