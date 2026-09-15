import { AREAS } from "@mseezee/shared";
import type {
  Circle,
  CircleStatus,
  CircleType,
  LocationPrecision,
  VerificationTier,
} from "@mseezee/shared";
import type { Circle as DbCircle, User as DbUser } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { getLiveTotals } from "@/lib/liveContributions";

/**
 * Real, organiser-created circles, stored in Prisma. Converted to the same
 * `Circle` shape the mock fixtures use — money figures always come from
 * `getLiveTotals`, never a stored column — so `listCircles` in `api.ts` can
 * merge the two sources without either side knowing about the other.
 */

type DbCircleWithOrganiser = DbCircle & { organiser: Pick<DbUser, "name" | "phone" | "email"> };

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

async function toSharedCircle(row: DbCircleWithOrganiser): Promise<Circle | null> {
  const area = AREAS.find((a) => a.slug === row.areaSlug);
  if (!area) return null; // the wizard only offers slugs from this same list

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
    area: { slug: area.slug, name: area.name, kind: area.kind, municipality: area.municipality },
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
  };
}

export async function listDbCircles(areaSlug?: string): Promise<Circle[]> {
  const rows = await prisma.circle.findMany({
    where: areaSlug ? { areaSlug } : undefined,
    include: { organiser: true },
    orderBy: { createdAt: "desc" },
  });
  const mapped = await Promise.all(rows.map(toSharedCircle));
  return mapped.filter((c): c is Circle => c !== null);
}

export async function getDbCircleBySlug(slug: string): Promise<Circle | null> {
  const row = await prisma.circle.findUnique({
    where: { slug },
    include: { organiser: true },
  });
  return row ? toSharedCircle(row) : null;
}

export async function listDbCirclesByOrganiser(organiserId: string): Promise<Circle[]> {
  const rows = await prisma.circle.findMany({
    where: { organiserId },
    include: { organiser: true },
    orderBy: { createdAt: "desc" },
  });
  const mapped = await Promise.all(rows.map(toSharedCircle));
  return mapped.filter((c): c is Circle => c !== null);
}

export interface CreateCircleInput {
  type: CircleType;
  title: string;
  story: string;
  beneficiaryName: string;
  areaSlug: string;
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
      areaSlug: input.areaSlug,
      areaSection: input.areaSection || null,
      locationPrecision: input.locationPrecision,
      goalCents: input.goalCents,
      organiserId,
    },
    include: { organiser: true },
  });
  return toSharedCircle(row);
}
