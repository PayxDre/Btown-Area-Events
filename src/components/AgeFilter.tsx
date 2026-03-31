"use client";

import { useState } from "react";
import { AGE_GROUPS, ageGroupsForChildAge } from "@/lib/age-groups";
import type { AgeGroupKey } from "@/lib/age-groups";

const AGE_ICONS: Record<string, string> = {
  baby: "&#x1f476;",
  toddler: "&#x1f9d2;",
  preschool: "&#x1f3a8;",
  kid: "&#x26bd;",
  teen: "&#x1f3ae;",
  adult: "&#x1f9d1;",
  family: "&#x1f46a;",
};

export default function AgeFilter({
  selected,
  onChange,
}: {
  selected: AgeGroupKey[];
  onChange: (groups: AgeGroupKey[]) => void;
}) {
  const [childAge, setChildAge] = useState("");

  const toggle = (group: AgeGroupKey) => {
    if (selected.includes(group)) {
      onChange(selected.filter((g) => g !== group));
    } else {
      onChange([...selected, group]);
    }
  };

  const handleChildAge = () => {
    const age = parseFloat(childAge);
    if (isNaN(age) || age < 0) return;
    const groups = ageGroupsForChildAge(age);
    const merged = [...new Set([...selected, ...groups])];
    onChange(merged);
    setChildAge("");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <label className="text-sm font-bold text-slate-700">
          Age Groups
        </label>
      </div>

      <div className="space-y-1 mb-3">
        {(Object.entries(AGE_GROUPS) as [AgeGroupKey, (typeof AGE_GROUPS)[AgeGroupKey]][]).map(
          ([key, { label }]) => (
            <label
              key={key}
              className={`flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-xl transition-all ${
                selected.includes(key) ? "bg-indigo-50 border border-indigo-200" : "border border-transparent hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => toggle(key)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: AGE_ICONS[key] || "" }}
              />
              <span className={`text-sm ${selected.includes(key) ? "font-semibold text-indigo-700" : "text-slate-600"}`}>
                {label}
              </span>
            </label>
          )
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 mt-3">
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          Quick add: My child is age...
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="17"
            step="0.5"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChildAge()}
            placeholder="e.g. 1.5"
            className="flex-1 border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
          />
          <button
            onClick={handleChildAge}
            className="bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
