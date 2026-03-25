export interface RawEvent {
  sourceId: string;
  source: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  venueName?: string;
  venueAddress?: string;
  city: string;
  state?: string;
  sourceUrl?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  rawAgeHints?: string[];
}

export interface Scraper {
  source: string;
  scrape(): Promise<RawEvent[]>;
}

export interface ScrapeResult {
  source: string;
  eventsFound: number;
  eventsNew: number;
  error?: string;
}
