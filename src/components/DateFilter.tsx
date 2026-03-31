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
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <label className="text-sm font-bold text-slate-700">
          Date Range
        </label>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1 font-medium">From</label>
          <input
            type="date"
            value={from}
            min={today}
            onChange={(e) => onChange(e.target.value, to)}
            className="w-full border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1 font-medium">To</label>
          <input
            type="date"
            value={to}
            min={from || today}
            onChange={(e) => onChange(from, e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
