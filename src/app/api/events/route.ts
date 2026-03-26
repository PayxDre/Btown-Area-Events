import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { runAllScrapers } from "@/lib/scrapers";
import { isTimeBlocked, eventMatchesAgeGroups } from "@/lib/filters";
import type { BlockedWindow } from "@/lib/filters";
import type { AgeGroupKey } from "@/lib/age-groups";
import { getBoundingBox, haversineDistance } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const prisma = await getPrisma();
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

  // Build base Prisma query
  const where: Record<string, unknown> = {};

  // Date range filter
  const fromDate = from ? new Date(from) : new Date();
  const toDate = to
    ? new Date(to)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  where.startDate = { gte: fromDate, lte: toDate };

  // City filter — try to match city name, zip code, or address
  // If nothing matches, fall back to showing all events
  let cityFilterApplied = false;
  if (city) {
    where.OR = [
      { city: { contains: city } },
      { zipCode: { contains: city } },
      { address: { contains: city } },
      { state: { contains: city } },
    ];
    cityFilterApplied = true;
  }

  // Search filter (combined with city OR if both present)
  if (search) {
    const searchConditions = [
      { title: { contains: search } },
      { description: { contains: search } },
      { venueName: { contains: search } },
    ];
    if (cityFilterApplied) {
      // Both city and search: events must match city AND search
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  // Location bounding box pre-filter
  if (lat !== undefined && lng !== undefined) {
    const box = getBoundingBox(lat, lng, radius);
    where.latitude = { gte: box.minLat, lte: box.maxLat };
    where.longitude = { gte: box.minLng, lte: box.maxLng };
  }

  // Fetch events from DB
  let allEvents = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  // If city filter returned zero results, auto-scrape for this location
  // then retry the query
  let fallback = false;
  if (allEvents.length === 0 && cityFilterApplied && city) {
    const isZip = /^\d{5}$/.test(city);
    try {
      await runAllScrapers({
        postalCode: isZip ? city : undefined,
        city: isZip ? undefined : city,
      });
      // Re-query after scraping
      allEvents = await prisma.event.findMany({
        where,
        orderBy: { startDate: "asc" },
      });
    } catch (err) {
      console.error("Auto-scrape failed:", err);
    }

    // If still no results, fall back to showing all events
    if (allEvents.length === 0) {
      const fallbackWhere: Record<string, unknown> = {
        startDate: { gte: fromDate, lte: toDate },
      };
      allEvents = await prisma.event.findMany({
        where: fallbackWhere,
        orderBy: { startDate: "asc" },
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
      (e) => !isTimeBlocked(e.startDate, blockedWindows)
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
  const events = paged.map((e) => ({
    id: e.id,
    sourceId: e.sourceId,
    source: e.source,
    title: e.title,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate?.toISOString() || null,
    allDay: e.allDay,
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
    isFree: e.isFree,
  }));

  return NextResponse.json({ events, total, page, pages, fallback });
}
