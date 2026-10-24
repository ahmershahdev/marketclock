import { connection } from "next/server";
import { api } from "@/lib/api/client";
import { llmsFull } from "@/lib/llms";

export async function GET(): Promise<Response> {
  await connection();
  const markets = await api.markets();
  return new Response(llmsFull(markets.ok ? markets.data : null), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
