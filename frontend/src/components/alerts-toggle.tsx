"use client";

import { useSyncExternalStore } from "react";
import { ALERTS_EVENT, alertsEnabled, setAlertsEnabled } from "@/lib/alerts";

type State = "unsupported" | "denied" | "on" | "off" | null;

function currentState(): State {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return alertsEnabled() && Notification.permission === "granted" ? "on" : "off";
}

function subscribe(onChange: () => void) {
  window.addEventListener(ALERTS_EVENT, onChange);
  return () => window.removeEventListener(ALERTS_EVENT, onChange);
}

export function AlertsToggle() {
  const state = useSyncExternalStore(subscribe, currentState, () => null);

  async function turnOn() {
    const permission = await Notification.requestPermission();
    setAlertsEnabled(permission === "granted");
  }

  if (state === null) return <div className="h-24" aria-hidden="true" />;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-rule bg-surface p-6 md:flex-row md:items-center">
      <div>
        <p className="mb-1 eyebrow">Alerts</p>
        <p className="max-w-xl text-sm text-ink-2">
          {state === "unsupported" && "This browser cannot show notifications."}
          {state === "denied" &&
            "Notifications are blocked for this site. Allow them in your browser's site settings to use alerts."}
          {state === "on" &&
            "On: a notification when a watched market is closed or closes early today or tomorrow, while MarketClock is open in a tab."}
          {state === "off" &&
            "Get a notification when a watched market is closed or closes early today or tomorrow. Works while MarketClock is open in a tab; nothing leaves your browser."}
        </p>
      </div>
      {state === "off" && (
        <button
          type="button"
          onClick={turnOn}
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Turn on alerts
        </button>
      )}
      {state === "on" && (
        <button
          type="button"
          onClick={() => setAlertsEnabled(false)}
          className="shrink-0 rounded-full border border-rule-strong px-5 py-2.5 text-sm transition-colors hover:border-ink"
        >
          Turn off
        </button>
      )}
    </div>
  );
}
