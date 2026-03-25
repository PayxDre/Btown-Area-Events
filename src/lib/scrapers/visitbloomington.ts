import * as cheerio from "cheerio";
import type { RawEvent, Scraper } from "./types";

export class VisitBloomingtonScraper implements Scraper {
  source = "visitbloomington";

  async scrape(): Promise<RawEvent[]> {
    const url = "https://www.visitbloomington.com/events/";
    const res = await fetch(url, {
      headers: { "User-Agent": "BtownAreaEvents/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Visit Bloomington returned ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const events: RawEvent[] = [];

    // Scrape event listings - the selectors may need adjustment
    // as the site structure can change
    $(".event-item, .listing-item, article.event").each((_, el) => {
      const $el = $(el);
      const title =
        $el.find("h2, h3, .title, .event-title").first().text().trim();
      const link = $el.find("a").first().attr("href");
      const dateText = $el
        .find(".date, .event-date, time")
        .first()
        .text()
        .trim();
      const description = $el
        .find(".description, .summary, p")
        .first()
        .text()
        .trim();
      const venue = $el
        .find(".venue, .location, .event-location")
        .first()
        .text()
        .trim();

      if (!title) return;

      const startDate = parseEventDate(dateText);
      if (!startDate) return;

      const sourceId = link
        ? link.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 100)
        : `vb-${title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 50)}`;

      events.push({
        sourceId,
        source: this.source,
        title,
        description: description || undefined,
        startDate,
        venueName: venue || undefined,
        city: "Bloomington",
        state: "IN",
        sourceUrl: link
          ? link.startsWith("http")
            ? link
            : `https://www.visitbloomington.com${link}`
          : undefined,
      });
    });

    return events;
  }
}

function parseEventDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch {
    // Fall through to manual parsing
  }

  // Try common patterns like "March 25, 2026" or "3/25/2026"
  const monthDayYear = dateStr.match(
    /(\w+)\s+(\d{1,2}),?\s*(\d{4})/
  );
  if (monthDayYear) {
    const parsed = new Date(`${monthDayYear[1]} ${monthDayYear[2]}, ${monthDayYear[3]}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}
