import type { Scraper, ScrapeResult } from "./types";
import { normalizeAndUpsert } from "./normalize";
import { IUEventsScraper } from "./iu-events";
import { VisitBloomingtonScraper } from "./visitbloomington";
import { TicketmasterScraper } from "./ticketmaster";
import { JeffKnowsBoyrertownScraper } from "./jeff-knows-boyertown";

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

  // Boyertown area scraper (19525, 19512, etc.)
  const isBoyertownArea =
    !options ||
    options.city?.toLowerCase().includes("boyertown") ||
    options.city?.toLowerCase().includes("gilbertsville") ||
    options.postalCode?.startsWith("195");

  // Location-specific scrapers for Bloomington, IN
  const isBloomington =
    !options ||
    options.city?.toLowerCase().includes("bloomington") ||
    options.postalCode?.startsWith("474");

  const scrapers: Scraper[] = [ticketmaster];
  if (isBoyertownArea) {
    scrapers.push(new JeffKnowsBoyrertownScraper());
  }
  if (isBloomington) {
    scrapers.push(new IUEventsScraper(), new VisitBloomingtonScraper());
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
