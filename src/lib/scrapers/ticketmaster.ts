import { format, addDays } from "date-fns";
import type { RawEvent, Scraper } from "./types";

interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
    end?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
  };
  info?: string;
  pleaseNote?: string;
  images?: { url: string; width: number; height: number }[];
  classifications?: {
    segment?: { name: string };
    genre?: { name: string };
    subGenre?: { name: string };
  }[];
  priceRanges?: { min: number; max: number }[];
  _embedded?: {
    venues?: {
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
      state?: { stateCode?: string; name?: string };
      postalCode?: string;
      location?: { latitude?: string; longitude?: string };
    }[];
  };
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page?: {
    totalElements: number;
  };
}

export class TicketmasterScraper implements Scraper {
  source = "ticketmaster";

  constructor(
    private location?: { postalCode?: string; city?: string; stateCode?: string },
    private radiusMiles: number = 25
  ) {}

  async scrape(): Promise<RawEvent[]> {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      console.warn("TICKETMASTER_API_KEY not set, skipping Ticketmaster scraper");
      return [];
    }

    const startDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const endDate = format(addDays(new Date(), 14), "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const params = new URLSearchParams({
      apikey: apiKey,
      startDateTime: startDate,
      endDateTime: endDate,
      size: "50",
      sort: "date,asc",
      radius: this.radiusMiles.toString(),
      unit: "miles",
    });

    if (this.location?.postalCode) {
      params.set("postalCode", this.location.postalCode);
    } else if (this.location?.city) {
      if (this.location.stateCode) {
        params.set("stateCode", this.location.stateCode);
      }
      params.set("city", this.location.city);
    }

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "BtownAreaEvents/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Ticketmaster API returned ${res.status}`);
    }

    const data: TicketmasterResponse = await res.json();
    const events = data._embedded?.events ?? [];

    return events.map((event) => {
      const venue = event._embedded?.venues?.[0];
      const startDateTime = event.dates?.start?.dateTime
        ? new Date(event.dates.start.dateTime)
        : event.dates?.start?.localDate
          ? new Date(event.dates.start.localDate + "T12:00:00")
          : new Date();

      const endDateTime = event.dates?.end?.dateTime
        ? new Date(event.dates.end.dateTime)
        : event.dates?.end?.localDate
          ? new Date(event.dates.end.localDate + "T23:59:59")
          : undefined;

      const isFree =
        event.priceRanges && event.priceRanges.length > 0
          ? event.priceRanges[0].min === 0
          : undefined;

      const ageHints: string[] = [];
      if (event.classifications) {
        for (const c of event.classifications) {
          if (c.segment?.name) ageHints.push(c.segment.name);
          if (c.genre?.name) ageHints.push(c.genre.name);
          if (c.subGenre?.name) ageHints.push(c.subGenre.name);
        }
      }
      if (event.pleaseNote) ageHints.push(event.pleaseNote);

      // Pick best image (prefer 16:9 ratio, reasonable size)
      const image = event.images
        ?.sort((a, b) => b.width - a.width)
        ?.find((img) => img.width >= 200 && img.width <= 1200);

      return {
        sourceId: event.id,
        source: this.source,
        title: event.name,
        description: event.info?.slice(0, 1000),
        startDate: startDateTime,
        endDate: endDateTime,
        venueName: venue?.name,
        venueAddress: venue?.address?.line1,
        city: venue?.city?.name ?? this.location?.city ?? "Unknown",
        state: venue?.state?.stateCode ?? this.location?.stateCode,
        sourceUrl: event.url,
        imageUrl: image?.url,
        latitude: venue?.location?.latitude
          ? parseFloat(venue.location.latitude)
          : undefined,
        longitude: venue?.location?.longitude
          ? parseFloat(venue.location.longitude)
          : undefined,
        rawAgeHints: ageHints,
      };
    });
  }
}
