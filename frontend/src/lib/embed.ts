import type { Market, MarketStatus } from "@/lib/api/types";
import { statusLabel, type StatusTone } from "@/lib/market-status";
import { absoluteUrl } from "@/lib/site";

const THEMES = {
  light: { bg: "#ffffff", ink: "#0a0b0d", muted: "#666b63", rule: "rgba(10,11,13,0.12)" },
  dark: { bg: "#0e1013", ink: "#eef0ec", muted: "#80867e", rule: "rgba(238,240,236,0.14)" },
} as const;

const TONES: Record<StatusTone, string> = {
  open: "#0f8a4a",
  early: "#b26a00",
  closed: "#d93a2b",
  unknown: "#80867e",
};

export type Theme = keyof typeof THEMES;

export function parseTheme(value: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function embedHtml(market: Market, status: MarketStatus, now: number, theme: Theme): string {
  const colors = THEMES[theme];
  const label = statusLabel(status, now);
  const page = absoluteUrl(`/markets/${market.code}`);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="300">
<title>${escape(`${market.code}: ${label.text}`)}</title>
<style>
*{box-sizing:border-box;margin:0}
html,body{height:100%;background:transparent}
body{font:14px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:${colors.ink}}
a.card{display:flex;flex-direction:column;justify-content:space-between;gap:10px;height:100%;padding:14px 16px;border:1px solid ${colors.rule};border-radius:16px;background:${colors.bg};color:inherit;text-decoration:none}
.top{display:flex;align-items:center;gap:10px}
.top img{width:24px;height:18px;border-radius:3px;object-fit:cover}
.code{font:600 18px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-0.02em}
.name{color:${colors.muted};font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.status{display:flex;align-items:center;gap:8px;font:12px ui-monospace,SFMono-Regular,Menlo,monospace;color:${TONES[label.tone]}}
.dot{width:7px;height:7px;border-radius:50%;background:${TONES[label.tone]}}
.brand{font-size:11px;color:${colors.muted}}
</style>
</head>
<body>
<a class="card" href="${escape(page)}" target="_blank" rel="noopener">
<span class="top"><img src="/flags/${escape(market.country_code.toLowerCase())}.svg" alt=""><span class="code">${escape(market.code)}</span><span class="name">${escape(market.name)}</span></span>
<span class="status"><span class="dot"></span>${escape(label.text)}</span>
<span class="brand">MarketClock</span>
</a>
</body>
</html>
`;
}

export function embedSnippet(code: string): string {
  return `<iframe src="${absoluteUrl(`/embed/${code}`)}" width="320" height="120" style="border:0" title="${code} market status" loading="lazy"></iframe>`;
}
