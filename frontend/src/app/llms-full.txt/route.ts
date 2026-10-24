import { connection } from "next/server";
import { getMarkets } from "@/lib/api/server";
import { llmsFull } from "@/lib/llms";

export async function GET(): Promise<Response> {
  await connection();
  const markets = await getMarkets();
  return new Response(llmsFull(markets.ok ? markets.data : null), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
