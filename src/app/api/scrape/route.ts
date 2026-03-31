import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export async function POST(request: NextRequest) {
  // Simple API key protection
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.SCRAPE_API_KEY;

  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Accept location params to scrape events for a specific area
    let options: { postalCode?: string; city?: string; stateCode?: string } | undefined;
    try {
      const body = await request.json();
      if (body.postalCode || body.city) {
        options = {
          postalCode: body.postalCode,
          city: body.city,
          stateCode: body.stateCode,
        };
      }
    } catch {
      // No body or invalid JSON — scrape with defaults
    }

    const results = await runAllScrapers(options);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
