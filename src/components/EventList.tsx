"use client";

import type { EventData } from "@/types";
import EventCard from "./EventCard";

export default function EventList({
  events,
  loading,
  total,
  page,
  pages,
  onPageChange,
}: {
  events: EventData[];
  loading: boolean;
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="hidden sm:block w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1">
                <div className="h-5 bg-slate-100 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded-lg w-full mb-1" />
                <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-slate-700 text-lg font-semibold mb-1">No events found</p>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Try adjusting your filters, removing blocked times, or searching a different area.
          Events are currently seeded for Bloomington, IN.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-400 mb-4 font-medium">
        Showing {events.length} of {total} event{total !== 1 ? "s" : ""}
      </p>

      <div className="space-y-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    p === page
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-4 py-2 text-sm font-medium border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
