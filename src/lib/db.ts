import type { D1Database } from "@cloudflare/workers-types";

// Types matching our Event model
export interface EventRow {
  id: string;
  sourceId: string;
  source: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: number; // D1 stores booleans as 0/1
  venueName: string | null;
  address: string | null;
  city: string;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  ageGroups: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  isFree: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DB {
  findEvents(where: EventQuery): Promise<EventRow[]>;
  upsertEvent(event: UpsertEvent): Promise<{ isNew: boolean }>;
}

export interface EventQuery {
  startDate?: { gte?: Date; lte?: Date };
  city?: string;
  search?: string;
  latRange?: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

export interface UpsertEvent {
  sourceId: string;
  source: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  allDay?: boolean;
  venueName?: string | null;
  address?: string | null;
  city: string;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ageGroups: string;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  isFree?: boolean | null;
}

function getD1(): D1Database {
  // Try the OpenNext cloudflare context symbol
  const ctx = (globalThis as Record<symbol, { env?: { DB?: D1Database } } | undefined>)[
    Symbol.for("__cloudflare-context__")
  ];
  if (ctx?.env?.DB) return ctx.env.DB;

  // Try process.env style (some Cloudflare setups)
  const globalAny = globalThis as Record<string, unknown>;
  if (globalAny.DB) return globalAny.DB as D1Database;

  throw new Error(
    "D1 database not found. " +
    "Cloudflare context keys: " + JSON.stringify(
      Object.getOwnPropertyNames(globalThis).filter(k => k.includes("cloud") || k.includes("__"))
    ) +
    " | Symbol keys: " + JSON.stringify(
      Object.getOwnPropertySymbols(globalThis).map(s => s.toString())
    )
  );
}

class D1DB implements DB {
  constructor(private d1: D1Database) {}

  async findEvents(q: EventQuery): Promise<EventRow[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q.startDate?.gte) {
      conditions.push("startDate >= ?");
      params.push(q.startDate.gte.toISOString());
    }
    if (q.startDate?.lte) {
      conditions.push("startDate <= ?");
      params.push(q.startDate.lte.toISOString());
    }
    if (q.city) {
      conditions.push("(city LIKE ? OR zipCode LIKE ? OR address LIKE ? OR state LIKE ?)");
      const like = `%${q.city}%`;
      params.push(like, like, like, like);
    }
    if (q.search) {
      conditions.push("(title LIKE ? OR description LIKE ? OR venueName LIKE ?)");
      const like = `%${q.search}%`;
      params.push(like, like, like);
    }
    if (q.latRange) {
      conditions.push("latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?");
      params.push(q.latRange.minLat, q.latRange.maxLat, q.latRange.minLng, q.latRange.maxLng);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM Event ${whereClause} ORDER BY startDate ASC`;

    const result = await this.d1.prepare(sql).bind(...params).all<EventRow>();
    return result.results;
  }

  async upsertEvent(e: UpsertEvent): Promise<{ isNew: boolean }> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const sql = `
      INSERT INTO Event (id, sourceId, source, title, description, startDate, endDate, allDay, venueName, address, city, state, zipCode, latitude, longitude, ageGroups, sourceUrl, imageUrl, isFree, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (source, sourceId) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        startDate = excluded.startDate,
        endDate = excluded.endDate,
        allDay = excluded.allDay,
        venueName = excluded.venueName,
        address = excluded.address,
        city = excluded.city,
        state = excluded.state,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        ageGroups = excluded.ageGroups,
        sourceUrl = excluded.sourceUrl,
        imageUrl = excluded.imageUrl,
        updatedAt = excluded.updatedAt
    `;

    const result = await this.d1.prepare(sql).bind(
      id,
      e.sourceId,
      e.source,
      e.title,
      e.description ?? null,
      e.startDate.toISOString(),
      e.endDate?.toISOString() ?? null,
      e.allDay ? 1 : 0,
      e.venueName ?? null,
      e.address ?? null,
      e.city,
      e.state ?? null,
      e.zipCode ?? null,
      e.latitude ?? null,
      e.longitude ?? null,
      e.ageGroups,
      e.sourceUrl ?? null,
      e.imageUrl ?? null,
      e.isFree != null ? (e.isFree ? 1 : 0) : null,
      now,
      now
    ).run();

    return { isNew: (result.meta?.changes ?? 0) > 0 };
  }
}

// Always use D1 — no Prisma in the bundle at all
export function getDB(): DB {
  const d1 = getD1();
  return new D1DB(d1);
}
