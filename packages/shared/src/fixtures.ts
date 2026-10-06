import type {
  Circle,
  CirclePlace,
  CircleUpdate,
  Disbursement,
  Supporter,
  ThankYouThread,
} from "./types";
import { LEGACY_AREA_PLACES } from "./places";

function areaRef(slug: string): CirclePlace {
  const place = LEGACY_AREA_PLACES[slug];
  if (!place) throw new Error(`unknown area: ${slug}`);
  return place;
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

const CIRCLES_SEED: Circle[] = [
  {
    id: "circle_mokoena",
    slug: "mokoena-family-soweto",
    type: "funeral",
    title: "In loving memory of Thabo Mokoena",
    summary:
      "Helping the Mokoena family lay their father to rest with dignity. Service on Saturday.",
    story:
      "Bab' Thabo Mokoena passed away peacefully at home last week after a short illness. He was a taxi driver on the Soweto–Joburg route for 28 years and a deacon at his church. He leaves behind his wife MmaMokoena and three children, two still in school. The family is raising funds for the funeral service, transport for relatives from Limpopo, and the after-tears gathering. Every contribution, however small, carries the family through this week.",
    beneficiaryName: "Mokoena family",
    organiserName: "Lerato Mokoena",
    proxyName: "St John's Methodist Church, Orlando West",
    area: areaRef("soweto"),
    locationPrecision: "area",
    goalCents: 5_000_000,
    raisedCents: 1_875_000,
    supporterCount: 63,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(6),
    eventDate: daysAhead(3),
    cover: { tone: "funeral", monogram: "TM" },
  },
  {
    id: "circle_dlomo_street",
    slug: "dlomo-street-paving-lighting-umlazi",
    type: "community",
    title: "Dlomo Street paving & lighting",
    summary:
      "Residents fixing potholes and installing solar lights on a dark stretch of road in V Section.",
    story:
      "Dlomo Street floods every summer and the lack of lighting has made it unsafe after dark. The street committee has quotes for gravel, drainage, and six solar streetlights. We have completed phase one — clearing and levelling — with volunteer labour. Phase two needs materials. This circle is run by the elected street committee and every expense is posted as an update.",
    beneficiaryName: "Dlomo Street Committee",
    organiserName: "Musa Zulu",
    area: areaRef("umlazi"),
    areaSection: "V Section",
    locationPrecision: "area",
    goalCents: 6_000_000,
    raisedCents: 2_450_000,
    supporterCount: 42,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(21),
    cover: { tone: "community", monogram: "DS" },
  },
  {
    id: "circle_gogo_roof",
    slug: "gogo-mthembu-roof-mdantsane",
    type: "family",
    title: "A new roof for Gogo Mthembu",
    summary:
      "Her roof was torn off in the October storms. She is 81 and lives alone in NU7.",
    story:
      "Gogo Nomvula Mthembu has lived in her house in NU7 for over forty years. The storm in October took most of her roof sheeting and the ceiling has since collapsed in two rooms. Her grandson, who works in East London, has a quote from a local builder for sheeting, timber, and labour. The ward councillor's office has verified her situation.",
    beneficiaryName: "Nomvula Mthembu",
    organiserName: "Sipho Mthembu",
    area: areaRef("mdantsane"),
    areaSection: "NU7",
    locationPrecision: "area",
    goalCents: 2_200_000,
    raisedCents: 1_040_000,
    supporterCount: 29,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(9),
    cover: { tone: "family", monogram: "NM" },
  },
  {
    id: "circle_dignity_packs",
    slug: "dignity-packs-khayelitsha",
    type: "essentials",
    title: "Dignity packs for Site C girls",
    summary:
      "Sanitary pads and toiletries for 90 girls at two high schools who miss class every month without them.",
    story:
      "Teachers at two Site C high schools flagged the same thing independently: girls missing up to a week of school a month because they can't afford sanitary pads. Sisters Uplift, a local mentorship NPO, now packs and delivers monthly dignity packs — pads, soap, and underwear — to 90 girls across both schools. This circle covers three months of packs. Every delivery is logged with the school's life-orientation teacher.",
    beneficiaryName: "Sisters Uplift mentorship programme",
    organiserName: "Noluthando Jacobs",
    proxyName: "Sisters Uplift NPC",
    area: areaRef("khayelitsha"),
    areaSection: "Site C",
    locationPrecision: "area",
    goalCents: 2_100_000,
    raisedCents: 847_000,
    supporterCount: 58,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(11),
    cover: { tone: "essentials", monogram: "DP" },
  },
];

/** Seeded so the app never looks empty before real circles exist — never
 *  payable, see `Circle.isDemo` and the contribute-flow checks that gate on it. */
export const CIRCLES: Circle[] = CIRCLES_SEED.map((c) => ({ ...c, isDemo: true }));

export const UPDATES: CircleUpdate[] = [
  {
    id: "update_1",
    circleId: "circle_dlomo_street",
    body: "Phase one is done — the street has been cleared and levelled by 14 volunteers over two Saturdays. Next we buy gravel and drainage pipe. Thank you to everyone who has contributed so far.",
    createdAt: daysAgo(7),
  },
  {
    id: "update_2",
    circleId: "circle_dlomo_street",
    body: "Quote accepted for six solar streetlights from a supplier in Isipingo. Deposit paid from funds raised. Receipt attached in the committee WhatsApp group.",
    createdAt: daysAgo(2),
  },
  {
    id: "update_3",
    circleId: "circle_mokoena",
    body: "The family is deeply grateful. The service is confirmed for Saturday 10:00 at the church hall. Transport for relatives from Limpopo has been arranged thanks to your support.",
    createdAt: daysAgo(1),
  },
  {
    id: "update_5",
    circleId: "circle_gogo_roof",
    body: "The builder has measured up and can start as soon as the sheeting is bought. Gogo is staying with her niece two streets away until the roof is on.",
    createdAt: daysAgo(2),
  },
];

const supporterSeed: Array<Omit<Supporter, "id" | "createdAt"> & { day: number }> = [
  { circleId: "circle_mokoena", displayName: "Mthokozisi Pini", amountCents: 50_000, message: "Stay strong, the whole street is with you.", anonymous: false, fromAreaName: "Soweto", day: 0 },
  { circleId: "circle_mokoena", displayName: "Zanele Nkosi", amountCents: 20_000, anonymous: false, fromAreaName: "Soweto", day: 0 },
  { circleId: "circle_mokoena", displayName: "A neighbour", amountCents: 10_000, anonymous: true, fromAreaName: "Soweto", day: 1 },
  { circleId: "circle_mokoena", displayName: "Sibusiso Dlamini", amountCents: 50_000, message: "Robala ka khotso, Bab' Thabo.", anonymous: false, fromAreaName: "Diepkloof", day: 1 },
  { circleId: "circle_mokoena", displayName: "Nomsa & family", amountCents: 100_000, anonymous: false, day: 2 },
  { circleId: "circle_mokoena", displayName: "Thandi M.", amountCents: 30_000, anonymous: false, fromAreaName: "Soweto", day: 2 },
  { circleId: "circle_dlomo_street", displayName: "Thandi Mahlangu", amountCents: 50_000, message: "Been asking for those lights for years. Thank you committee.", anonymous: false, fromAreaName: "Umlazi", day: 1 },
  { circleId: "circle_dlomo_street", displayName: "S. Zulu", amountCents: 20_000, anonymous: false, fromAreaName: "Umlazi", day: 3 },
  { circleId: "circle_dlomo_street", displayName: "Anonymous", amountCents: 100_000, anonymous: true, day: 4 },
  { circleId: "circle_gogo_roof", displayName: "Lwazi from NU2", amountCents: 20_000, anonymous: false, fromAreaName: "Mdantsane", day: 1 },
  { circleId: "circle_dignity_packs", displayName: "Zizipho M.", amountCents: 15_000, message: "Every girl deserves to stay in class. Thank you for this work.", anonymous: false, fromAreaName: "Khayelitsha", day: 1 },
  { circleId: "circle_dignity_packs", displayName: "Anonymous", amountCents: 50_000, anonymous: true, day: 2 },
  { circleId: "circle_dignity_packs", displayName: "Site C Stokvel", amountCents: 100_000, anonymous: false, fromAreaName: "Khayelitsha", day: 4 },
];

export const SUPPORTERS: Supporter[] = supporterSeed.map((s, i) => ({
  id: `supporter_${i + 1}`,
  circleId: s.circleId,
  displayName: s.displayName,
  amountCents: s.amountCents,
  message: s.message,
  anonymous: s.anonymous,
  fromAreaName: s.fromAreaName,
  createdAt: daysAgo(s.day),
}));

/* -------------------------------------------------------------- *
 *  Dashboard fixtures                                            *
 * -------------------------------------------------------------- */

/** The demo organiser whose view `/dashboard` renders. */
export const DEMO_ORGANISER = "Lerato Mokoena";
/** The demo partner whose view `/dashboard/partner` renders. */
export const DEMO_PARTNER = "St John's Methodist Church, Orlando West";
export const DEMO_PARTNER_REGISTRATION = "Registered NPO 041-926";

export const THANK_YOUS: ThankYouThread[] = [
  { id: "ty_1", circleId: "circle_mokoena", supporterName: "Nomsa & family", amountCents: 100_000, thanked: false, createdAt: daysAgo(2) },
  { id: "ty_2", circleId: "circle_mokoena", supporterName: "Sibusiso Dlamini", amountCents: 50_000, supporterMessage: "Robala ka khotso, Bab' Thabo.", thanked: false, createdAt: daysAgo(1) },
  { id: "ty_3", circleId: "circle_mokoena", supporterName: "Mthokozisi Pini", amountCents: 50_000, supporterMessage: "Stay strong, the whole street is with you.", thanked: true, createdAt: daysAgo(3) },
  { id: "ty_4", circleId: "circle_mokoena", supporterName: "Thandi M.", amountCents: 30_000, thanked: false, createdAt: daysAgo(2) },
];

export const DISBURSEMENTS: Disbursement[] = [
  {
    id: "disb_1",
    circleId: "circle_mokoena",
    circleTitle: "In loving memory of Thabo Mokoena",
    amountCents: 1_200_000,
    status: "paid",
    destination: "Bopape Funeral Directors (invoice #4471)",
    requestedAt: daysAgo(3),
    paidAt: daysAgo(2),
    evidenceLabel: "Funeral home invoice",
  },
  {
    id: "disb_2",
    circleId: "circle_mokoena",
    circleTitle: "In loving memory of Thabo Mokoena",
    amountCents: 450_000,
    status: "requested",
    destination: "Mokoena family (groceries & transport)",
    requestedAt: daysAgo(1),
    evidenceLabel: "Quote for relative transport",
  },
];
