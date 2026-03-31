import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { RawEvent, Scraper } from "./types";

const SITE_URL = "https://jeffknowsboyertown.com";

export class JeffKnowsBoyrertownScraper implements Scraper {
  source = "jeff_knows_boyertown";

  async scrape(): Promise<RawEvent[]> {
    // Try WordPress REST API first (easier to parse), fall back to HTML scraping
    const posts = await this.fetchLatestPosts();
    const allEvents: RawEvent[] = [];

    for (const post of posts) {
      const events = this.parsePostContent(post.content, post.url);
      allEvents.push(...events);
    }

    return allEvents;
  }

  private async fetchLatestPosts(): Promise<
    { content: string; url: string }[]
  > {
    // Try WordPress REST API
    try {
      const apiUrl = `${SITE_URL}/wp-json/wp/v2/posts?per_page=3&search=whats+going+down`;
      const res = await fetch(apiUrl, {
        headers: { "User-Agent": "BtownAreaEvents/1.0" },
      });

      if (res.ok) {
        const posts = (await res.json()) as {
          content: { rendered: string };
          link: string;
        }[];
        return posts.map((p) => ({
          content: p.content.rendered,
          url: p.link,
        }));
      }
    } catch {
      // WordPress API not available, fall back to HTML
    }

    // Fall back: scrape the homepage for latest post links
    try {
      const res = await fetch(SITE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) return [];

      const html = await res.text();
      const $ = load(html);
      const postUrls: string[] = [];

      // Find links to "whats-going-down" posts
      $('a[href*="whats-going-down"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href && !postUrls.includes(href)) {
          postUrls.push(href);
        }
      });

      // Fetch the most recent posts (up to 2)
      const posts: { content: string; url: string }[] = [];
      for (const url of postUrls.slice(0, 2)) {
        try {
          const postRes = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
          if (postRes.ok) {
            posts.push({ content: await postRes.text(), url });
          }
        } catch {
          // Skip failed fetches
        }
      }

      return posts;
    } catch {
      return [];
    }
  }

  private parsePostContent(html: string, postUrl: string): RawEvent[] {
    const $ = load(html);
    const events: RawEvent[] = [];

    // Find date headers — bold/strong text like "THURSDAY 3/26/2026"
    // They could be in <strong>, <b>, <h2>, <h3>, or <p> tags
    let currentDate: Date | null = null;

    // Get the main content area
    const content = $(".entry-content, .post-content, article, .content").first();
    const container = content.length ? content : $("body");

    // Walk through all elements in order
    const elements = container.find("p, li, h1, h2, h3, h4, h5, h6, strong, b");

    elements.each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;

      // Check if this is a date header like "THURSDAY 3/26/2026" or "SATURDAY 3/22/2026"
      const dateMatch = text.match(
        /(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i
      );

      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        currentDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        return;
      }

      // If we're inside a list item and have a current date, parse the event
      if (currentDate && $(el).is("li")) {
        const event = this.parseEventLine(text, currentDate, postUrl, $(el));
        if (event) {
          events.push(event);
        }
      }
    });

    return events;
  }

  private parseEventLine(
    text: string,
    date: Date,
    postUrl: string,
    $el: ReturnType<CheerioAPI>
  ): RawEvent | null {
    // Format: "Event Title – Venue, City Time"
    // or: "Event Title (details) – Venue, City Time"
    // Time patterns: "6pm", "6-8pm", "6:30-9pm", "10am-2pm"

    // Extract time from end of string
    const timeMatch = text.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*$/i
    ) || text.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*$/i
    );

    let startTime: string | null = null;
    let endTime: string | null = null;
    let textWithoutTime = text;

    if (timeMatch) {
      textWithoutTime = text.slice(0, timeMatch.index).trim();
      if (timeMatch[2]) {
        startTime = timeMatch[1].trim();
        endTime = timeMatch[2].trim();
      } else {
        startTime = timeMatch[1].trim();
      }
    }

    // Split on " – " or " - " to separate event title from venue
    const parts = textWithoutTime.split(/\s*[–—-]\s*/);
    if (parts.length < 1) return null;

    const title = parts[0].trim();
    if (!title) return null;

    // Parse venue and city from remaining parts
    let venueName: string | undefined;
    let city = "Boyertown";

    if (parts.length >= 2) {
      const venuePart = parts.slice(1).join(" – ").trim();
      // Last word after comma is usually the city
      const commaIdx = venuePart.lastIndexOf(",");
      if (commaIdx > 0) {
        venueName = venuePart.slice(0, commaIdx).trim();
        city = venuePart.slice(commaIdx + 1).trim();
      } else {
        venueName = venuePart;
      }
    }

    // Build start/end dates with time
    const startDate = new Date(date);
    if (startTime) {
      const parsed = this.parseTime(startTime);
      if (parsed) {
        startDate.setHours(parsed.hours, parsed.minutes);
      }
    }

    let endDate: Date | undefined;
    if (endTime) {
      endDate = new Date(date);
      const parsed = this.parseTime(endTime);
      if (parsed) {
        endDate.setHours(parsed.hours, parsed.minutes);
      }
    }

    // Extract any links from the list item
    const link = $el.find("a").first().attr("href");

    // Generate a stable source ID from title + date
    const sourceId = `jkb-${date.toISOString().split("T")[0]}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 40)}`;

    return {
      sourceId,
      source: this.source,
      title,
      description: venueName ? `At ${venueName} in ${city}` : undefined,
      startDate,
      endDate,
      venueName,
      city,
      state: "PA",
      sourceUrl: link || postUrl,
      rawAgeHints: [title, venueName || ""].filter(Boolean),
    };
  }

  private parseTime(
    timeStr: string
  ): { hours: number; minutes: number } | null {
    // Parse "6pm", "6:30pm", "10am", "6:30 PM"
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3].toLowerCase();

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return { hours, minutes };
  }
}
