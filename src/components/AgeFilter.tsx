"use client";

import { useState } from "react";
import { AGE_GROUPS, ageGroupsForChildAge } from "@/lib/age-groups";
import type { AgeGroupKey } from "@/lib/age-groups";

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
    // Merge with existing, deduped
    const merged = [...new Set([...selected, ...groups])];
    onChange(merged);
    setChildAge("");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Age Groups
      </label>

      <div className="space-y-1.5 mb-3">
        {(Object.entries(AGE_GROUPS) as [AgeGroupKey, (typeof AGE_GROUPS)[AgeGroupKey]][]).map(
          ([key, { label }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => toggle(key)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          )
        )}
      </div>

      <div className="border-t border-gray-200 pt-3 mt-3">
        <label className="block text-xs text-gray-500 mb-1">
          Quick: My child is age...
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="17"
            step="0.5"
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            placeholder="e.g. 1.5"
            className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm"
          />
          <button
            onClick={handleChildAge}
            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
