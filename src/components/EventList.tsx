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
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No events found</p>
        <p className="text-gray-400 text-sm mt-1">
          Try adjusting your filters or search a different area
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        {total} event{total !== 1 ? "s" : ""} found
      </p>

      <div className="space-y-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
