"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { format, addDays } from "date-fns";
import SearchBar from "@/components/SearchBar";
import EventList from "@/components/EventList";
import TimeFilter from "@/components/TimeFilter";
import AgeFilter from "@/components/AgeFilter";
import DateFilter from "@/components/DateFilter";
import type { AgeGroupKey } from "@/lib/age-groups";
import type { BlockedWindow } from "@/lib/filters";
import type { EventData, EventsResponse } from "@/types";

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const city = searchParams.get("city") || "";

  const today = format(new Date(), "yyyy-MM-dd");
  const twoWeeks = format(addDays(new Date(), 14), "yyyy-MM-dd");

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [ageGroups, setAgeGroups] = useState<AgeGroupKey[]>([]);
  const [blockedWindows, setBlockedWindows] = useState<BlockedWindow[]>([]);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(twoWeeks);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (dateFrom) params.set("from", new Date(dateFrom).toISOString());
    if (dateTo) params.set("to", new Date(dateTo + "T23:59:59").toISOString());
    if (ageGroups.length > 0) params.set("ageGroups", ageGroups.join(","));
    if (blockedWindows.length > 0)
      params.set("blockedWindows", JSON.stringify(blockedWindows));
    if (search) params.set("search", search);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/events?${params}`);
      const data: EventsResponse = await res.json();
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [city, dateFrom, dateTo, ageGroups, blockedWindows, search, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [ageGroups, blockedWindows, dateFrom, dateTo, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar initialValue={city} compact />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden w-full text-left font-medium text-gray-700 mb-3 flex items-center justify-between"
          >
            Filters
            <span>{filtersOpen ? "Hide" : "Show"}</span>
          </button>

          <div
            className={`space-y-6 bg-white rounded-lg border border-gray-200 p-4 ${filtersOpen ? "" : "hidden lg:block"}`}
          >
            {/* Search within results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DateFilter
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />

            <TimeFilter
              blockedWindows={blockedWindows}
              onChange={setBlockedWindows}
            />

            <AgeFilter selected={ageGroups} onChange={setAgeGroups} />
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {city ? `Events near ${city}` : "All Events"}
          </h2>
          <EventList
            events={events}
            loading={loading}
            total={total}
            page={page}
            pages={pages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-6">Loading...</div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
