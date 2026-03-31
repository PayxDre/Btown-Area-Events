"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialValue = "",
  compact = false,
}: {
  initialValue?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      // If empty search, show all events
      router.push("/events");
      return;
    }
    router.push(`/events?city=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 ${compact ? "" : "max-w-lg mx-auto"}`}
    >
      <div className={`relative flex-1 ${compact ? "" : ""}`}>
        {!compact && (
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city name or zip code..."
          className={`w-full border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all ${
            compact
              ? "rounded-xl px-3 py-2 text-sm"
              : "rounded-xl pl-11 pr-4 py-3.5 text-base shadow-sm"
          }`}
        />
      </div>
      <button
        type="submit"
        className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg ${
          compact
            ? "rounded-xl px-4 py-2 text-sm"
            : "rounded-xl px-8 py-3.5"
        }`}
      >
        Search
      </button>
    </form>
  );
}
