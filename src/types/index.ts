import type { AgeGroupKey } from "@/lib/age-groups";

export interface EventData {
  id: string;
  sourceId: string;
  source: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  venueName: string | null;
  address: string | null;
  city: string;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  ageGroups: AgeGroupKey[];
  sourceUrl: string | null;
  imageUrl: string | null;
  isFree: boolean | null;
}

export interface EventsResponse {
  events: EventData[];
  total: number;
  page: number;
  pages: number;
}
