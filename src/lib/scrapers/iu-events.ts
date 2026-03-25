import { format } from "date-fns";
import type { RawEvent, Scraper } from "./types";

interface IUEventJSON {
  id: string;
  title: string;
  description?: string;
  date_dt: string;
  date2_dt?: string;
  location_title?: string;
  location_latitude?: string;
  location_longitude?: string;
  url?: string;
  thumb?: string;
}

export class IUEventsScraper implements Scraper {
  source = "iu_events";

  async scrape(): Promise<RawEvent[]> {
    const startDate = format(new Date(), "yyyy-MM-dd");
    const url = `https://events.iu.edu/live/json/events/max/50/start_date/${startDate}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "BtownAreaEvents/1.0" },
    });

    if (!res.ok) {
      throw new Error(`IU Events API returned ${res.status}`);
    }

    const data: IUEventJSON[] = await res.json();

    return data.map((event) => ({
      sourceId: event.id.toString(),
      source: this.source,
      title: stripHtml(event.title),
      description: event.description
        ? stripHtml(event.description).slice(0, 1000)
        : undefined,
      startDate: new Date(event.date_dt),
      endDate: event.date2_dt ? new Date(event.date2_dt) : undefined,
      venueName: event.location_title || undefined,
      city: "Bloomington",
      state: "IN",
      sourceUrl: event.url
        ? `https://events.iu.edu${event.url}`
        : undefined,
      imageUrl: event.thumb || undefined,
      latitude: event.location_latitude
        ? parseFloat(event.location_latitude)
        : undefined,
      longitude: event.location_longitude
        ? parseFloat(event.location_longitude)
        : undefined,
    }));
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#?\w+;/g, " ").trim();
}
