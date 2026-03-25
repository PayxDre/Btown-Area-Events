import { prisma } from "@/lib/db";
import { classifyAgeGroups } from "@/lib/age-groups";
import type { RawEvent, ScrapeResult } from "./types";

export async function normalizeAndUpsert(
  events: RawEvent[]
): Promise<ScrapeResult> {
  const source = events[0]?.source ?? "unknown";
  let eventsNew = 0;

  for (const raw of events) {
    const text = `${raw.title} ${raw.description || ""} ${(raw.rawAgeHints || []).join(" ")}`;
    const ageGroups = classifyAgeGroups(text);

    try {
      const result = await prisma.event.upsert({
        where: {
          source_sourceId: { source: raw.source, sourceId: raw.sourceId },
        },
        update: {
          title: raw.title,
          description: raw.description || null,
          startDate: raw.startDate,
          endDate: raw.endDate || null,
          allDay: raw.allDay || false,
          venueName: raw.venueName || null,
          address: raw.venueAddress || null,
          city: raw.city,
          state: raw.state || null,
          latitude: raw.latitude || null,
          longitude: raw.longitude || null,
          ageGroups: JSON.stringify(ageGroups),
          sourceUrl: raw.sourceUrl || null,
          imageUrl: raw.imageUrl || null,
        },
        create: {
          sourceId: raw.sourceId,
          source: raw.source,
          title: raw.title,
          description: raw.description || null,
          startDate: raw.startDate,
          endDate: raw.endDate || null,
          allDay: raw.allDay || false,
          venueName: raw.venueName || null,
          address: raw.venueAddress || null,
          city: raw.city,
          state: raw.state || null,
          latitude: raw.latitude || null,
          longitude: raw.longitude || null,
          ageGroups: JSON.stringify(ageGroups),
          sourceUrl: raw.sourceUrl || null,
          imageUrl: raw.imageUrl || null,
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        eventsNew++;
      }
    } catch (err) {
      console.error(`Failed to upsert event ${raw.sourceId}:`, err);
    }
  }

  return {
    source,
    eventsFound: events.length,
    eventsNew,
  };
}
