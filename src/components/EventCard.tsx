import { format } from "date-fns";
import type { EventData } from "@/types";

const AGE_GROUP_COLORS: Record<string, string> = {
  baby: "bg-pink-100 text-pink-700 border-pink-200",
  toddler: "bg-purple-100 text-purple-700 border-purple-200",
  preschool: "bg-indigo-100 text-indigo-700 border-indigo-200",
  kid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  teen: "bg-amber-100 text-amber-700 border-amber-200",
  adult: "bg-rose-100 text-rose-700 border-rose-200",
  family: "bg-sky-100 text-sky-700 border-sky-200",
};

const AGE_GROUP_LABELS: Record<string, string> = {
  baby: "Baby",
  toddler: "Toddler",
  preschool: "Pre-K",
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 card-hover group">
      <div className="flex gap-4">
        {/* Date badge */}
        <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shrink-0">
          <span className="text-xs font-bold text-indigo-600 uppercase leading-none">
            {format(startDate, "MMM")}
          </span>
          <span className="text-lg font-extrabold text-slate-800 leading-none mt-0.5">
            {format(startDate, "d")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors">
              {event.sourceUrl ? (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.title}
                </a>
              ) : (
                event.title
              )}
            </h3>
            {event.isFree && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                FREE
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeStr}
            </span>
            <span className="text-slate-300">|</span>
            <span>{dateStr}</span>
          </div>

          {event.venueName && (
            <p className="mt-1 text-sm text-slate-400 inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venueName}
            </p>
          )}

          {event.description && (
            <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {event.ageGroups.map((group) => (
              <span
                key={group}
                className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${AGE_GROUP_COLORS[group] || "bg-slate-100 text-slate-700 border-slate-200"}`}
              >
                {AGE_GROUP_LABELS[group] || group}
              </span>
            ))}
            <span className="ml-auto text-xs text-slate-300 font-medium">
              via {event.source.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
