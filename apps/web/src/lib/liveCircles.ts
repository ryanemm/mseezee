import type {
  Circle,
  CirclePlace,
  CircleStatus,
  CircleType,
  LocationPrecision,
  VerificationTier,
} from "@mseezee/shared";
import type { Circle as DbCircle, Place as DbPlace, User as DbUser } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { getLiveTotals } from "@/lib/liveContributions";

/**
 * Real, organiser-created circles, stored in Prisma. Converted to the same
 * `Circle` shape the mock fixtures use — money figures always come from
 * `getLiveTotals`, never a stored column — so `listCircles` in `api.ts` can
 * merge the two sources without either side knowing about the other.
 */

type DbCircleWithOrganiser = DbCircle & {
  organiser: Pick<DbUser, "name" | "phone" | "email">;
  place: DbPlace;
};

const INCLUDE = { organiser: true, place: true } as const;

/** The place a circle shows publicly. Funerals (and anyone who chose to hide
 *  their location) only ever show the main place — some sub places are just a
 *  few streets, which is too precise next to a running total. */
export function publicPlace(
  place: DbPlace,
  type: string,
  precision: string,
): CirclePlace {
  const coarse = type === "funeral" || precision === "hidden";
  if (coarse || place.kind === "main") {
    return {
      id: place.mainPlaceId,
      name: place.mainPlaceName,
      mainPlaceId: place.mainPlaceId,
      mainPlaceName: place.mainPlaceName,
      municipality: place.municipality,
      province: place.province,
      lat: place.mainLat,
      lng: place.mainLng,
    };
  }
  return {
    id: place.id,
    name: place.name,
    mainPlaceId: place.mainPlaceId,
    mainPlaceName: place.mainPlaceName,
    municipality: place.municipality,
    province: place.province,
    lat: place.lat,
    lng: place.lng,
  };
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 60);
  return base || "circle";
}

function monogram(title: string): string {
  const words = title
    .replace(/[^a-zA-Z ]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "MZ";
  const first = words[0]![0] ?? "";
  const second = words.length > 1 ? (words.at(-1)![0] ?? "") : (words[0]![1] ?? "");
  return (first + second).toUpperCase();
}

function organiserDisplayName(organiser: DbCircleWithOrganiser["organiser"]): string {
  return organiser.name ?? organiser.email ?? organiser.phone ?? "MseeZee organiser";
}

async function toSharedCircle(row: DbCircleWithOrganiser): Promise<Circle> {
  const live = await getLiveTotals(row.id);

  return {
    id: row.id,
    slug: row.slug,
    type: row.type as CircleType,
    title: row.title,
    summary: row.summary,
    story: row.story,
    beneficiaryName: row.beneficiaryName,
    organiserName: organiserDisplayName(row.organiser),
    proxyName: row.proxyName ?? undefined,
    area: publicPlace(row.place, row.type, row.locationPrecision),
    locationPrecision: row.locationPrecision as LocationPrecision,
    areaSection: row.areaSection ?? undefined,
    goalCents: row.goalCents,
    raisedCents: live.settledCents,
    supporterCount: live.settledCount,
    status: row.status as CircleStatus,
    verificationTier: row.verificationTier as VerificationTier,
    createdAt: row.createdAt.toISOString(),
    eventDate: row.eventDate?.toISOString(),
    cover: { tone: row.type as Circle["cover"]["tone"], monogram: monogram(row.title) },
    isDemo: false,
    payoutReady: Boolean(row.payoutSubaccountCode),
  };
}

/** Real circles, optionally only those in a place (or anywhere inside it, for
 *  a main place). Matched on the *public* place, so a funeral never turns up
 *  on the page of the sub place it's really in. */
export async function listDbCircles(placeId?: string): Promise<Circle[]> {
  const rows = await prisma.circle.findMany({
    where: placeId
      ? { OR: [{ placeId }, { place: { mainPlaceId: placeId } }] }
      : undefined,
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  const mapped = await Promise.all(rows.map(toSharedCircle));
  return placeId
    ? mapped.filter((c) => c.area.id === placeId || c.area.mainPlaceId === placeId)
    : mapped;
}

export async function getDbCircleBySlug(slug: string): Promise<Circle | null> {
  const row = await prisma.circle.findUnique({
    where: { slug },
    include: INCLUDE,
  });
  return row ? toSharedCircle(row) : null;
}

export async function listDbCirclesByOrganiser(organiserId: string): Promise<Circle[]> {
  const rows = await prisma.circle.findMany({
    where: { organiserId },
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(rows.map(toSharedCircle));
}

export interface CreateCircleInput {
  type: CircleType;
  title: string;
  story: string;
  beneficiaryName: string;
  placeId: string;
  areaSection?: string;
  locationPrecision: LocationPrecision;
  goalCents: number;
}

export async function createCircle(
  organiserId: string,
  input: CreateCircleInput,
): Promise<Circle | null> {
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
  const summary = input.story.length > 140 ? `${input.story.slice(0, 137)}…` : input.story;

  const row = await prisma.circle.create({
    data: {
      slug,
      type: input.type,
      title: input.title,
      summary,
      story: input.story,
      beneficiaryName: input.beneficiaryName,
      placeId: input.placeId,
      areaSection: input.areaSection || null,
      locationPrecision: input.locationPrecision,
      goalCents: input.goalCents,
      organiserId,
    },
    include: INCLUDE,
  });
  return toSharedCircle(row);
}
