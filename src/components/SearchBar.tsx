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
    if (!query.trim()) return;
    router.push(`/events?city=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${compact ? "" : "max-w-lg mx-auto"}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter city name or zip code..."
        className={`flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${compact ? "py-2 text-sm" : ""}`}
      />
      <button
        type="submit"
        className={`bg-blue-600 text-white rounded-lg px-6 font-medium hover:bg-blue-700 transition-colors ${compact ? "py-2 px-4 text-sm" : "py-3"}`}
      >
        Search
      </button>
    </form>
  );
}
