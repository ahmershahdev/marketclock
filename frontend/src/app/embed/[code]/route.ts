import { connection } from "next/server";
import { api } from "@/lib/api/client";
import { getMarkets } from "@/lib/api/server";
import { embedHtml, parseTheme } from "@/lib/embed";

export async function GET(request: Request, { params }: RouteContext<"/embed/[code]">) {
  await connection();
  const code = (await params).code.toUpperCase();
  const theme = parseTheme(new URL(request.url).searchParams.get("theme"));
  const [markets, status] = await Promise.all([getMarkets(), api.status(code)]);
  const market = markets.ok ? markets.data.find((item) => item.code === code) : undefined;
  if (!market || !status.ok) {
    return new Response("Unknown market or the API is unreachable.", {
      status: market ? 503 : 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
    });
  }
  return new Response(embedHtml(market, status.data, Date.now(), theme), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-Robots-Tag": "noindex",
    },
  });
}
