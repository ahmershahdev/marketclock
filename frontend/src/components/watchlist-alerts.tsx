"use client";

import { useEffect } from "react";
import { api } from "@/lib/api/client";
import { ALERTS_EVENT, alertsEnabled, dueAlerts, readSent, rememberSent } from "@/lib/alerts";
import { todayIn } from "@/lib/calendar";

const WATCHLIST_KEY = "watchlist";
const CHECK_EVERY_MS = 30 * 60 * 1000;

function watchedCodes(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

async function check() {
  const codes = watchedCodes();
  if (!alertsEnabled() || codes.length === 0) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const markets = await api.markets();
  if (!markets.ok) return;
  const sent = readSent();
  for (const market of markets.data.filter((m) => codes.includes(m.code))) {
    const today = todayIn(market.timezone, Date.now());
    const year = Number(today.slice(0, 4));
    const results = await Promise.all([
      api.holidays(market.code, year),
      api.holidays(market.code, year + 1),
    ]);
    const holidays = results.flatMap((result) => (result.ok ? result.data.holidays : []));
    const alerts = dueAlerts(market.code, today, holidays, sent);
    for (const alert of alerts) {
      new Notification(alert.title, { body: alert.body, tag: alert.key, icon: "/icon.png" });
      sent.add(alert.key);
    }
    if (alerts.length)
      rememberSent(
        alerts.map((alert) => alert.key),
        today,
      );
  }
}

// Notifications only fire while a MarketClock tab is open: background push would need a server
// that stores a subscription per visitor, which the no-personal-data rule rules out.
export function WatchlistAlerts() {
  useEffect(() => {
    const run = () => void check().catch(() => undefined);
    run();
    const timer = setInterval(run, CHECK_EVERY_MS);
    window.addEventListener(ALERTS_EVENT, run);
    return () => {
      clearInterval(timer);
      window.removeEventListener(ALERTS_EVENT, run);
    };
  }, []);
  return null;
}
