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
    const results = await runAllScrapers();
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
