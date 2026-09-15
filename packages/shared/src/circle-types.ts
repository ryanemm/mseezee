import type { CircleType } from "./types.js";

/**
 * The single source of truth for what a circle "is" — the create wizard, the
 * home feed's filter tabs, the type chip, and each circle's cover art all
 * read from this list instead of each hard-coding their own copy of it.
 * Adding a cause the platform wants to support is a change in one place.
 */
export interface CircleTypeDef {
  key: CircleType;
  /** Full name — create wizard, page titles. */
  label: string;
  /** Compact name — filter tabs, chips. */
  shortLabel: string;
  /** One-line description shown when picking a type in the create wizard. */
  blurb: string;
}

export const CIRCLE_TYPES: CircleTypeDef[] = [
  {
    key: "funeral",
    label: "Funeral Support",
    shortLabel: "Funerals",
    blurb: "Help a grieving family with funeral and related costs.",
  },
  {
    key: "family",
    label: "Family / Personal",
    shortLabel: "Family",
    blurb: "A wedding, medical costs, a home repair — one family's circumstances.",
  },
  {
    key: "essentials",
    label: "Child & Youth Essentials",
    shortLabel: "Essentials",
    blurb:
      "School uniforms, stationery, sanitary pads — the everyday things a child needs to show up with dignity.",
  },
  {
    key: "community",
    label: "Neighbourhood / Community Project",
    shortLabel: "Community",
    blurb: "Fix a street, a park, a crèche — something the whole area uses.",
  },
];

export function findCircleType(key: string): CircleTypeDef | undefined {
  return CIRCLE_TYPES.find((t) => t.key === key);
}

export const CIRCLE_TYPE_KEYS: CircleType[] = CIRCLE_TYPES.map((t) => t.key);

export function isCircleType(value: string): value is CircleType {
  return (CIRCLE_TYPE_KEYS as string[]).includes(value);
}
