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
    // Prevent duplicates
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Block Out Times
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Hide events during times that don&apos;t work (e.g., nap time)
      </p>

      {blockedWindows.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {blockedWindows.map((window, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-red-50 border border-red-200 rounded-md px-3 py-1.5 text-sm"
            >
              <span className="text-red-700">
                {formatTime(window.start)} - {formatTime(window.end)}
              </span>
              <button
                onClick={() => removeWindow(i)}
                className="text-red-400 hover:text-red-600 ml-2"
                aria-label="Remove blocked time"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={addWindow}
          className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
        >
          Block
        </button>
      </div>
    </div>
  );
}
