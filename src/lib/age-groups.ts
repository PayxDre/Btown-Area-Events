export const AGE_GROUPS = {
  baby: { label: "Babies (0-1)", minAge: 0, maxAge: 1 },
  toddler: { label: "Toddlers (1-3)", minAge: 1, maxAge: 3 },
  preschool: { label: "Preschool (3-5)", minAge: 3, maxAge: 5 },
  kid: { label: "Kids (5-12)", minAge: 5, maxAge: 12 },
  teen: { label: "Teens (13-17)", minAge: 13, maxAge: 17 },
  adult: { label: "Adults (18+)", minAge: 18, maxAge: 999 },
  family: { label: "All Ages / Family", minAge: 0, maxAge: 999 },
} as const;

export type AgeGroupKey = keyof typeof AGE_GROUPS;

const AGE_KEYWORDS: Record<AgeGroupKey, string[]> = {
  baby: ["baby", "babies", "infant", "newborn", "ages 0-1"],
  toddler: [
    "toddler",
    "toddlers",
    "storytime",
    "story time",
    "preschool",
    "ages 1-3",
    "ages 0-4",
    "little ones",
  ],
  preschool: ["preschool", "pre-k", "prek", "ages 3-5", "ages 4-5"],
  kid: [
    "kids",
    "children",
    "youth",
    "ages 5-12",
    "ages 6-12",
    "elementary",
  ],
  teen: [
    "teen",
    "teens",
    "teenager",
    "ages 13-17",
    "middle school",
    "high school",
  ],
  adult: [
    "21+",
    "21 and over",
    "adults only",
    "beer",
    "wine",
    "cocktail",
    "brewery",
    "pub",
    "bar crawl",
    "happy hour",
  ],
  family: [
    "family",
    "families",
    "all ages",
    "family-friendly",
    "family friendly",
  ],
};

export function classifyAgeGroups(text: string): AgeGroupKey[] {
  const lower = text.toLowerCase();
  const matched: AgeGroupKey[] = [];

  for (const [group, keywords] of Object.entries(AGE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(group as AgeGroupKey);
    }
  }

  // Default to family if nothing matched
  if (matched.length === 0) {
    matched.push("family");
  }

  return matched;
}

export function ageGroupsForChildAge(age: number): AgeGroupKey[] {
  const groups: AgeGroupKey[] = [];
  for (const [key, { minAge, maxAge }] of Object.entries(AGE_GROUPS)) {
    if (key === "family") continue;
    if (age >= minAge && age <= maxAge) {
      groups.push(key as AgeGroupKey);
    }
  }
  // Always include family
  groups.push("family");
  return groups;
}
