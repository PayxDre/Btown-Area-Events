import { NextRequest, NextResponse } from "next/server";
import { getDB, type EventRow } from "@/lib/db";
import { runAllScrapers } from "@/lib/scrapers";
import { isTimeBlocked, eventMatchesAgeGroups } from "@/lib/filters";
import type { BlockedWindow } from "@/lib/filters";
import type { AgeGroupKey } from "@/lib/age-groups";
import { getBoundingBox, haversineDistance } from "@/lib/geo";

export async function GET(request: NextRequest) {
  try {
  const db = getDB();
  const params = request.nextUrl.searchParams;

  const city = params.get("city") || undefined;
  const from = params.get("from");
  const to = params.get("to");
  const ageGroupsParam = params.get("ageGroups");
  const blockedWindowsParam = params.get("blockedWindows");
  const search = params.get("search") || undefined;
  const lat = params.get("lat") ? parseFloat(params.get("lat")!) : undefined;
  const lng = params.get("lng") ? parseFloat(params.get("lng")!) : undefined;
  const radius = params.get("radius")
    ? parseFloat(params.get("radius")!)
    : 15;
  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") || "20")));

  // Date range — include past 7 days by default so recent events show up
  const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const toDate = to
    ? new Date(to)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // Location bounding box
  const latRange = (lat !== undefined && lng !== undefined)
    ? getBoundingBox(lat, lng, radius)
    : undefined;

  // Fetch events from DB
  let allEvents = await db.findEvents({
    startDate: { gte: fromDate, lte: toDate },
    city,
    search,
    latRange: latRange ? {
      minLat: latRange.minLat, maxLat: latRange.maxLat,
      minLng: latRange.minLng, maxLng: latRange.maxLng,
    } : undefined,
  });

  // If city filter returned zero results, auto-scrape for this location
  let fallback = false;
  let scrapeDebug: unknown = null;
  if (allEvents.length === 0 && city) {
    const isZip = /^\d{5}$/.test(city);
    try {
      const scrapeResults = await runAllScrapers({
        postalCode: isZip ? city : undefined,
        city: isZip ? undefined : city,
      });
      scrapeDebug = scrapeResults;
      // Re-query after scraping — first try with city filter
      allEvents = await db.findEvents({
        startDate: { gte: fromDate, lte: toDate },
        city,
        search,
      });
      // If zip code didn't match, try without city filter
      // (scraped events have city names like "Boyertown" not zip codes)
      if (allEvents.length === 0) {
        allEvents = await db.findEvents({
          startDate: { gte: fromDate, lte: toDate },
          search,
        });
      }
    } catch (err) {
      scrapeDebug = { error: err instanceof Error ? err.message : String(err) };
    }

    // If still no results after scraping, show all events as fallback
    if (allEvents.length === 0) {
      allEvents = await db.findEvents({
        startDate: { gte: fromDate, lte: toDate },
      });
      fallback = true;
    }
  }

  // Apply in-memory filters
  let filtered = allEvents;

  // Age group filter
  const ageGroups = ageGroupsParam
    ? (ageGroupsParam.split(",") as AgeGroupKey[])
    : undefined;
  if (ageGroups && ageGroups.length > 0) {
    filtered = filtered.filter((e) =>
      eventMatchesAgeGroups(e.ageGroups, ageGroups)
    );
  }

  // Blocked time windows filter
  let blockedWindows: BlockedWindow[] = [];
  if (blockedWindowsParam) {
    try {
      blockedWindows = JSON.parse(blockedWindowsParam);
    } catch {
      // ignore invalid JSON
    }
  }
  if (blockedWindows.length > 0) {
    filtered = filtered.filter(
      (e) => !isTimeBlocked(new Date(e.startDate), blockedWindows)
    );
  }

  // Distance filter (Haversine refinement)
  if (lat !== undefined && lng !== undefined) {
    filtered = filtered.filter((e) => {
      if (e.latitude == null || e.longitude == null) return true;
      return haversineDistance(lat, lng, e.latitude, e.longitude) <= radius;
    });
  }

  // Pagination
  const total = filtered.length;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paged = filtered.slice(offset, offset + limit);

  // Transform for response
  const events = paged.map((e: EventRow) => ({
    id: e.id,
    sourceId: e.sourceId,
    source: e.source,
    title: e.title,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    allDay: !!e.allDay,
    venueName: e.venueName,
    address: e.address,
    city: e.city,
    state: e.state,
    zipCode: e.zipCode,
    latitude: e.latitude,
    longitude: e.longitude,
    ageGroups: JSON.parse(e.ageGroups),
    sourceUrl: e.sourceUrl,
    imageUrl: e.imageUrl,
    isFree: e.isFree != null ? !!e.isFree : null,
  }));

  return NextResponse.json({ events, total, page, pages, fallback, scrapeDebug });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
