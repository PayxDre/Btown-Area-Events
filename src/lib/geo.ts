export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  city: string;
  state: string;
}

export async function geocode(query: string): Promise<GeoResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "BtownAreaEvents/1.0" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  const result = data[0];
  const addr = result.address || {};

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name,
    city: addr.city || addr.town || addr.village || addr.county || query,
    state: addr.state || "",
  };
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusMiles / 69.0;
  const lngDelta = radiusMiles / (69.0 * Math.cos(toRad(lat)));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
