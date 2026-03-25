"use client";

import { format } from "date-fns";

export default function DateFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Date Range
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={from}
            min={today}
            onChange={(e) => onChange(e.target.value, to)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={to}
            min={from || today}
            onChange={(e) => onChange(from, e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
