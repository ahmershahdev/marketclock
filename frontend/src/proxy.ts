import { NextResponse, type NextRequest } from "next/server";

// Redirects live here, before rendering: inside a streamed page they arrive after a 200 status.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/holidays") {
    const year = new Date().getUTCFullYear();
    return NextResponse.redirect(new URL(`/holidays/${year}`, request.url), 307);
  }
  const market = /^\/markets\/([A-Za-z0-9]{2,10})$/.exec(pathname)?.[1];
  const year = searchParams.get("year");
  if (market && year && /^\d{4}$/.test(year)) {
    return NextResponse.redirect(
      new URL(`/markets/${market.toUpperCase()}/${year}`, request.url),
      308,
    );
  }
  return NextResponse.next();
}

export const config = { matcher: ["/holidays", "/markets/:code"] };
