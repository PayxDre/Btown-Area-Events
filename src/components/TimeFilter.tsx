"use client";

import { useState } from "react";
import type { BlockedWindow } from "@/lib/filters";

export default function TimeFilter({
  blockedWindows,
  onChange,
}: {
  blockedWindows: BlockedWindow[];
  onChange: (windows: BlockedWindow[]) => void;
}) {
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("14:00");

  const addWindow = () => {
    if (startTime >= endTime) return;
    const exists = blockedWindows.some(
      (w) => w.start === startTime && w.end === endTime
    );
    if (exists) return;
    onChange([...blockedWindows, { start: startTime, end: endTime }]);
  };

  const removeWindow = (index: number) => {
    onChange(blockedWindows.filter((_, i) => i !== index));
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <label className="text-sm font-bold text-slate-700">
          Block Out Times
        </label>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Hide events during times that don&apos;t work (e.g., nap time)
      </p>

      {blockedWindows.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {blockedWindows.map((window, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm"
            >
              <span className="text-red-700 font-medium">
                {formatTime(window.start)} &ndash; {formatTime(window.end)}
              </span>
              <button
                onClick={() => removeWindow(i)}
                className="text-red-300 hover:text-red-600 ml-2 transition-colors"
                aria-label="Remove blocked time"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1 font-medium">From</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1 font-medium">To</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={addWindow}
          className="bg-red-500 text-white px-3.5 py-1.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
        >
          Block
        </button>
      </div>
    </div>
  );
}
