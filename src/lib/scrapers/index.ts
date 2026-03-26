import type { ScrapeResult } from "./types";
import { normalizeAndUpsert } from "./normalize";
import { IUEventsScraper } from "./iu-events";
import { VisitBloomingtonScraper } from "./visitbloomington";
import { TicketmasterScraper } from "./ticketmaster";

export interface ScrapeOptions {
  postalCode?: string;
  city?: string;
  stateCode?: string;
}

export async function runAllScrapers(
  options?: ScrapeOptions
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  // Ticketmaster works for any location
  const ticketmaster = new TicketmasterScraper(
    options
      ? {
          postalCode: options.postalCode,
          city: options.city,
          stateCode: options.stateCode,
        }
      : undefined
  );

  // Location-specific scrapers for Bloomington, IN
  const isBloomington =
    !options ||
    options.city?.toLowerCase().includes("bloomington") ||
    options.postalCode?.startsWith("474");

  const scrapers = [ticketmaster];
  if (isBloomington) {
    scrapers.push(
      new IUEventsScraper() as typeof ticketmaster,
      new VisitBloomingtonScraper() as typeof ticketmaster
    );
  }

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
