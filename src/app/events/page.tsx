"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { format, addDays } from "date-fns";
import SearchBar from "@/components/SearchBar";
import EventList from "@/components/EventList";
import TimeFilter from "@/components/TimeFilter";
import AgeFilter from "@/components/AgeFilter";
import DateFilter from "@/components/DateFilter";
import type { AgeGroupKey } from "@/lib/age-groups";
import type { BlockedWindow } from "@/lib/filters";
import type { EventData } from "@/types";

interface EventsAPIResponse {
  events: EventData[];
  total: number;
  page: number;
  pages: number;
  fallback?: boolean;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";

  const today = format(addDays(new Date(), -30), "yyyy-MM-dd");
  const twoWeeks = format(addDays(new Date(), 30), "yyyy-MM-dd");

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
  const [isFallback, setIsFallback] = useState(false);

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
      const data: EventsAPIResponse = await res.json();
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
      setIsFallback(data.fallback || false);
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

  useEffect(() => {
    setPage(1);
  }, [ageGroups, blockedWindows, dateFrom, dateTo, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount =
    ageGroups.length + blockedWindows.length + (search ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar initialValue={city} compact />
      </div>

      {/* Fallback notice */}
      {isFallback && city && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              No events found for &ldquo;{city}&rdquo;
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Showing all available events instead. Try searching by city name (e.g. &ldquo;Boyertown&rdquo;) for better results.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden w-full text-left font-bold text-slate-700 mb-3 flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-4 py-3"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${filtersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`space-y-5 filter-gradient rounded-2xl border border-slate-200 p-5 shadow-sm ${filtersOpen ? "" : "hidden lg:block"}`}
          >
            {/* Search within results */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <label className="text-sm font-bold text-slate-700">
                  Search
                </label>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
              />
            </div>

            <hr className="border-slate-100" />

            <DateFilter
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
            />

            <hr className="border-slate-100" />

            <TimeFilter
              blockedWindows={blockedWindows}
              onChange={setBlockedWindows}
            />

            <hr className="border-slate-100" />

            <AgeFilter selected={ageGroups} onChange={setAgeGroups} />
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {city ? (
                <>Events near <span className="text-indigo-600">{city}</span></>
              ) : (
                "All Events"
              )}
            </h2>
          </div>
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
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
          Loading events...
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
