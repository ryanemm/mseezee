import type {
  AreaRef,
  Circle,
  CircleUpdate,
  Disbursement,
  Supporter,
  ThankYouThread,
} from "./types";
import { AREAS } from "./places";

function areaRef(slug: string): AreaRef {
  const area = AREAS.find((a) => a.slug === slug);
  if (!area) throw new Error(`unknown area: ${slug}`);
  return {
    slug: area.slug,
    name: area.name,
    kind: area.kind,
    municipality: area.municipality,
  };
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

export const CIRCLES: Circle[] = [
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
    id: "circle_zanele",
    slug: "zanele-family-bereavement-khayelitsha",
    type: "funeral",
    title: "Support for the Ndlovu family",
    summary:
      "Bereavement support for a young mother of two in Site B after a sudden loss.",
    story:
      "Zanele Ndlovu lost her husband Sipho in a workplace accident. He was the only earner in the home. Neighbours in Site B have come together to cover the funeral costs and to help Zanele with rent and school fees while she looks for work. The burial society is administering the funds.",
    beneficiaryName: "Ndlovu family",
    organiserName: "Nomsa Dlamini",
    proxyName: "Masakhane Burial Society",
    area: areaRef("khayelitsha"),
    areaSection: "Site B",
    locationPrecision: "area",
    goalCents: 3_800_000,
    raisedCents: 732_000,
    supporterCount: 41,
    status: "collecting",
    verificationTier: "id_verified",
    createdAt: daysAgo(4),
    eventDate: daysAhead(5),
    cover: { tone: "funeral", monogram: "ND" },
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
    id: "circle_youth_fund",
    slug: "sisonke-youth-fund-alexandra",
    type: "community",
    title: "Alex Youth Study Fund",
    summary:
      "Textbooks, data, and exam fees for 20 matriculants in Alexandra this year.",
    story:
      "A group of former teachers runs weekend classes for matric learners in Alexandra. This year we are supporting 20 learners with prescribed textbooks, monthly data for online past papers, and exam registration fees. Results and receipts from last year's cohort are on our updates page — 17 of 19 passed, 9 with bachelor passes.",
    beneficiaryName: "Alex Study Group",
    organiserName: "Grace Nkosi",
    proxyName: "Alexandra Community Trust (NPC)",
    area: areaRef("alexandra"),
    locationPrecision: "area",
    goalCents: 1_500_000,
    raisedCents: 1_520_000,
    supporterCount: 37,
    status: "goal_reached",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(30),
    cover: { tone: "community", monogram: "AY" },
  },
  {
    id: "circle_ndlovu_wedding",
    slug: "ndlovu-wedding-kwamashu",
    type: "family",
    title: "Sanele & Andile's wedding",
    summary:
      "A young couple in KwaMashu asking their community to help celebrate their traditional wedding.",
    story:
      "Sanele and Andile have been together for six years and are finally doing things properly. They are covering most of the umembeso themselves but are asking family and friends to help with the marquee, catering for 120 guests, and transport for the groom's family from Nongoma. Anything left over goes towards their first month of rent as a married couple.",
    beneficiaryName: "Sanele Ndlovu",
    organiserName: "Sanele Ndlovu",
    area: areaRef("kwamashu"),
    locationPrecision: "area",
    goalCents: 8_000_000,
    raisedCents: 3_265_000,
    supporterCount: 78,
    status: "collecting",
    verificationTier: "id_verified",
    createdAt: daysAgo(12),
    eventDate: daysAhead(64),
    cover: { tone: "family", monogram: "SA" },
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
    id: "circle_creche",
    slug: "little-stars-creche-tembisa",
    type: "community",
    title: "Little Stars Crèche kitchen",
    summary:
      "A registered crèche feeding 60 children needs a working kitchen after a fire.",
    story:
      "Little Stars looks after 60 children while their parents work. A gas leak caused a small fire in December that destroyed the kitchen. The crèche is registered with the Department of Social Development and provides two meals a day. We need a stove, prep counters, and basic rewiring so we can reopen fully.",
    beneficiaryName: "Little Stars Educare",
    organiserName: "Thandeka Mahlangu",
    proxyName: "Tembisa Early Learning Forum",
    area: areaRef("tembisa"),
    locationPrecision: "area",
    goalCents: 4_000_000,
    raisedCents: 986_000,
    supporterCount: 24,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(15),
    cover: { tone: "community", monogram: "LS" },
  },
  {
    id: "circle_mama_radebe",
    slug: "mama-radebe-medical-gugulethu",
    type: "family",
    title: "Mama Radebe's dialysis transport",
    summary:
      "Three trips a week to Groote Schuur for dialysis. The family needs help with taxi fare.",
    story:
      "Mama Nolwazi Radebe has been on dialysis for eight months. The treatment is free but the transport is not — three return trips a week from Gugulethu to Groote Schuur adds up to more than the household can carry. This circle covers six months of transport while her daughter completes her learnership and can take over the cost.",
    beneficiaryName: "Radebe family",
    organiserName: "Aphiwe Radebe",
    area: areaRef("gugulethu"),
    locationPrecision: "area",
    goalCents: 1_800_000,
    raisedCents: 1_242_000,
    supporterCount: 51,
    status: "collecting",
    verificationTier: "id_verified",
    createdAt: daysAgo(18),
    cover: { tone: "family", monogram: "NR" },
  },
  {
    id: "circle_park_mamelodi",
    slug: "phase-4-park-cleanup-mamelodi",
    type: "community",
    title: "Phase 4 park clean-up & swings",
    summary:
      "Turning an illegal dumping site back into a playground the whole street can use.",
    story:
      "The open space on the corner of Tsamaya Road has become a dumping ground. A group of parents has been clearing it on Saturdays for a month. We want to fence it, put in two benches and a swing set, and plant grass. The materials list and volunteer roster are on the updates page.",
    beneficiaryName: "Phase 4 Residents Association",
    organiserName: "Kabelo Sithole",
    area: areaRef("mamelodi"),
    areaSection: "Phase 4",
    locationPrecision: "area",
    goalCents: 3_000_000,
    raisedCents: 415_000,
    supporterCount: 13,
    status: "collecting",
    verificationTier: "id_verified",
    createdAt: daysAgo(5),
    cover: { tone: "community", monogram: "P4" },
  },
  {
    id: "circle_sithole_medical",
    slug: "sithole-family-medical-soweto",
    type: "family",
    title: "Help the Sithole family after the fire",
    summary:
      "A shack fire in Orlando East left a family of five with nothing. Their church is holding the collection.",
    story:
      "A candle started a fire in the early hours and the Sithole family lost their home and everything in it. No one was hurt. The congregation is helping with temporary accommodation, school uniforms for the three children, and rebuilding materials. St John's Methodist is administering the funds.",
    beneficiaryName: "Sithole family",
    organiserName: "Rev. Patrick Khumalo",
    proxyName: "St John's Methodist Church, Orlando West",
    area: areaRef("soweto"),
    areaSection: "Orlando East",
    locationPrecision: "area",
    goalCents: 2_500_000,
    raisedCents: 613_000,
    supporterCount: 22,
    status: "collecting",
    verificationTier: "evidence_verified",
    createdAt: daysAgo(8),
    cover: { tone: "family", monogram: "SF" },
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
  {
    id: "circle_uniforms_mamelodi",
    slug: "back-to-school-uniforms-mamelodi",
    type: "essentials",
    title: "Uniforms & stationery for Phase 4 learners",
    summary:
      "25 children starting the new term without a full uniform or basic stationery — a school and its parents' committee are covering the gap.",
    story:
      "The parents' committee at Phase 4 Primary keeps a quiet list of learners whose families can't manage a full uniform or stationery list at the start of term — no fuss, no forms in front of classmates. This year the list is 25 children. The committee buys in bulk directly from a uniform supplier in Mamelodi West and hands out stationery packs on the first day of term.",
    beneficiaryName: "Phase 4 Primary School",
    organiserName: "Mrs Dikeledi Sithole",
    proxyName: "Phase 4 Primary Parents' Committee",
    area: areaRef("mamelodi"),
    areaSection: "Phase 4",
    locationPrecision: "area",
    goalCents: 1_875_000,
    raisedCents: 1_120_000,
    supporterCount: 46,
    status: "collecting",
    verificationTier: "id_verified",
    createdAt: daysAgo(6),
    cover: { tone: "essentials", monogram: "U4" },
  },
];

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
    id: "update_4",
    circleId: "circle_youth_fund",
    body: "We have reached the goal. Textbooks are ordered and data bundles start this week. Any further contributions will go towards the June trial exam fees.",
    createdAt: daysAgo(3),
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
  { circleId: "circle_ndlovu_wedding", displayName: "Aunt Buhle", amountCents: 100_000, message: "Halala! Can't wait for the big day.", anonymous: false, fromAreaName: "KwaMashu", day: 2 },
  { circleId: "circle_ndlovu_wedding", displayName: "The Khumalos", amountCents: 50_000, anonymous: false, fromAreaName: "Nongoma", day: 5 },
  { circleId: "circle_mama_radebe", displayName: "Sister Agnes", amountCents: 30_000, message: "Praying for Mama. Sending taxi fare every month I can.", anonymous: false, fromAreaName: "Gugulethu", day: 1 },
  { circleId: "circle_mama_radebe", displayName: "Anonymous", amountCents: null, anonymous: true, day: 2 },
  { circleId: "circle_gogo_roof", displayName: "Lwazi from NU2", amountCents: 20_000, anonymous: false, fromAreaName: "Mdantsane", day: 1 },
  { circleId: "circle_creche", displayName: "Parents' committee", amountCents: 40_000, anonymous: false, fromAreaName: "Tembisa", day: 3 },
  { circleId: "circle_park_mamelodi", displayName: "Kabelo's colleagues", amountCents: 60_000, anonymous: false, fromAreaName: "Pretoria CBD", day: 1 },
  { circleId: "circle_dignity_packs", displayName: "Zizipho M.", amountCents: 15_000, message: "Every girl deserves to stay in class. Thank you for this work.", anonymous: false, fromAreaName: "Khayelitsha", day: 1 },
  { circleId: "circle_dignity_packs", displayName: "Anonymous", amountCents: 50_000, anonymous: true, day: 2 },
  { circleId: "circle_dignity_packs", displayName: "Site C Stokvel", amountCents: 100_000, anonymous: false, fromAreaName: "Khayelitsha", day: 4 },
  { circleId: "circle_uniforms_mamelodi", displayName: "Old Boys & Girls of Phase 4", amountCents: 80_000, anonymous: false, fromAreaName: "Mamelodi", day: 1 },
  { circleId: "circle_uniforms_mamelodi", displayName: "Thabang R.", amountCents: 25_000, message: "Went without a jersey myself in Grade 3. Happy to help.", anonymous: false, day: 3 },
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
  { id: "ty_5", circleId: "circle_sithole_medical", supporterName: "Orlando East cell group", amountCents: 45_000, supporterMessage: "The whole cell is praying for the family.", thanked: false, createdAt: daysAgo(3) },
  { id: "ty_6", circleId: "circle_sithole_medical", supporterName: "Anonymous", amountCents: null, thanked: false, createdAt: daysAgo(4) },
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
  {
    id: "disb_3",
    circleId: "circle_sithole_medical",
    circleTitle: "Help the Sithole family after the fire",
    amountCents: 300_000,
    status: "ready",
    destination: "Sithole family (school uniforms & bedding)",
  },
];
