import { format } from "date-fns";
import type { EventData } from "@/types";

const AGE_GROUP_COLORS: Record<string, string> = {
  baby: "bg-pink-100 text-pink-800",
  toddler: "bg-purple-100 text-purple-800",
  preschool: "bg-indigo-100 text-indigo-800",
  kid: "bg-green-100 text-green-800",
  teen: "bg-yellow-100 text-yellow-800",
  adult: "bg-red-100 text-red-800",
  family: "bg-blue-100 text-blue-800",
};

const AGE_GROUP_LABELS: Record<string, string> = {
  baby: "Baby",
  toddler: "Toddler",
  preschool: "Preschool",
  kid: "Kids",
  teen: "Teen",
  adult: "Adult",
  family: "Family",
};

export default function EventCard({ event }: { event: EventData }) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateStr = format(startDate, "EEE, MMM d");
  const timeStr = event.allDay
    ? "All Day"
    : `${format(startDate, "h:mm a")}${endDate ? ` - ${format(endDate, "h:mm a")}` : ""}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {event.sourceUrl ? (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {event.title}
              </a>
            ) : (
              event.title
            )}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>

          {event.venueName && (
            <p className="mt-1 text-sm text-gray-500">{event.venueName}</p>
          )}

          {event.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.ageGroups.map((group) => (
              <span
                key={group}
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${AGE_GROUP_COLORS[group] || "bg-gray-100 text-gray-800"}`}
              >
                {AGE_GROUP_LABELS[group] || group}
              </span>
            ))}
            {event.isFree && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Free
              </span>
            )}
          </div>
        </div>

        <div className="text-right text-xs text-gray-400 shrink-0">
          {event.source.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}
