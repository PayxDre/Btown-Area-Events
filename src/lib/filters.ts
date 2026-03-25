import type { AgeGroupKey } from "./age-groups";

export interface BlockedWindow {
  start: string; // "HH:mm" format, e.g. "12:00"
  end: string; // "HH:mm" format, e.g. "14:00"
}

export interface EventFilters {
  city?: string;
  from?: Date;
  to?: Date;
  ageGroups?: AgeGroupKey[];
  blockedWindows?: BlockedWindow[];
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isTimeBlocked(
  date: Date,
  blockedWindows: BlockedWindow[]
): boolean {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const eventMinutes = hours * 60 + minutes;

  return blockedWindows.some((window) => {
    const startMin = timeToMinutes(window.start);
    const endMin = timeToMinutes(window.end);
    return eventMinutes >= startMin && eventMinutes < endMin;
  });
}

export function eventMatchesAgeGroups(
  eventAgeGroups: string,
  filterGroups: AgeGroupKey[]
): boolean {
  try {
    const parsed: string[] = JSON.parse(eventAgeGroups);
    return filterGroups.some((g) => parsed.includes(g));
  } catch {
    return true; // If we can't parse, show the event
  }
}
