"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "watchlist";
const CHANGE_EVENT = "marketclock:watchlist";
const EMPTY: readonly string[] = [];

let cachedRaw: string | null = null;
let cachedList: readonly string[] = EMPTY;

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed)
      ? parsed.filter((code): code is string => typeof code === "string")
      : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function write(codes: readonly string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useWatchlist() {
  const codes = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    codes,
    has: (code: string) => codes.includes(code),
    toggle: (code: string) =>
      write(codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]),
    remove: (code: string) => write(codes.filter((c) => c !== code)),
  };
}
