import type { Scraper, ScrapeResult } from "./types";
import { normalizeAndUpsert } from "./normalize";
import { IUEventsScraper } from "./iu-events";
import { VisitBloomingtonScraper } from "./visitbloomington";

const scrapers: Scraper[] = [
  new IUEventsScraper(),
  new VisitBloomingtonScraper(),
];

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const scraper of scrapers) {
    try {
      console.log(`Scraping ${scraper.source}...`);
      const events = await scraper.scrape();

      if (events.length > 0) {
        const result = await normalizeAndUpsert(events);
        results.push(result);
        console.log(
          `${scraper.source}: found ${result.eventsFound}, new ${result.eventsNew}`
        );
      } else {
        results.push({
          source: scraper.source,
          eventsFound: 0,
          eventsNew: 0,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Scraper ${scraper.source} failed:`, message);
      results.push({
        source: scraper.source,
        eventsFound: 0,
        eventsNew: 0,
        error: message,
      });
    }
  }

  return results;
}
