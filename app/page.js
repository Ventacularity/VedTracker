"use client";

import { useCallback, useEffect, useState } from "react";

function timeAgo(iso) {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

export default function Home() {
  const [status, setStatus] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (res.ok) setStatus(await res.json());
    } catch {
      // Keep the last status on a failed poll.
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "72px 24px", textAlign: "center" }}>
      <p style={{ opacity: 0.7, letterSpacing: 1, textTransform: "uppercase", fontSize: 13 }}>What is Ved doing?</p>
      <h1 style={{ fontSize: 44, lineHeight: 1.15, margin: "16px 0" }}>
        {status ? `Ved is ${status.statusText}` : "Loading…"}
      </h1>
      {status?.place && !status.sleeping && (
        <p style={{ fontSize: 20, opacity: 0.85 }}>at {status.place}</p>
      )}
      {status?.updatedAt && (
        <p style={{ opacity: 0.6 }}>
          Last updated {timeAgo(status.updatedAt)}
          {status.stale && !status.sleeping ? " — may be out of date" : ""}
        </p>
      )}
      {status?.sleeping && <p style={{ fontSize: 28 }}>😴</p>}
    </main>
  );
}
