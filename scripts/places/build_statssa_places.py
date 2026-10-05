"""
Builds the `Place` table migration from Stats SA's Census 2011 sub place
boundaries.

One row per main place (e.g. "Soweto") and one per *named* sub place inside it
(e.g. "Orlando West"). Stats SA marks the part of a main place that has no
separate name with an " SP" suffix ("Lutzville SP"); those fold into their main
place's row instead of getting one of their own. Only a centre point is kept
for each place — never the boundary.

Source: Statistics South Africa, Census 2011 spatial metadata (sub places),
as mirrored at https://github.com/j-norwood-young/SA-Maps (Subplace.zip, via
Git LFS). Stats SA's terms require crediting them as the source.

Usage (one-off, re-run only if the source data changes):
    pip install pyshp
    python3 scripts/places/build_statssa_places.py \
        path/to/Subplace/SP_SA_2011 \
        apps/web/prisma/migrations/<timestamp>_add_places/migration.sql
"""

import collections
import sys

import shapefile  # pyshp

PROVINCES = {
    "1": "Western Cape",
    "2": "Eastern Cape",
    "3": "Northern Cape",
    "4": "Free State",
    "5": "KwaZulu-Natal",
    "6": "North West",
    "7": "Gauteng",
    "8": "Mpumalanga",
    "9": "Limpopo",
}

# The ten areas circles used before places existed, and the main place each
# one becomes. Municipality disambiguates names used more than once
# ("Tembisa" exists in three municipalities).
LEGACY_AREAS = {
    "soweto": ("Soweto", "City of Johannesburg"),
    "alexandra": ("Alexandra", "City of Johannesburg"),
    "sandton": ("Sandton", "City of Johannesburg"),
    "tembisa": ("Tembisa", "Ekurhuleni"),
    "mamelodi": ("Mamelodi", "City of Tshwane"),
    "khayelitsha": ("Khayelitsha", "City of Cape Town"),
    "gugulethu": ("Gugulethu", "City of Cape Town"),
    "mdantsane": ("Mdantsane", "Buffalo City"),
    "umlazi": ("Umlazi", "Ethekwini"),
    "kwamashu": ("KwaMashu", "Ethekwini"),
}


def ring_area_centroid(points):
    """Signed area and area-weighted centroid of one ring (shoelace)."""
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(points, points[1:] + points[:1]):
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    a /= 2.0
    if a == 0:
        return 0.0, points[0][0], points[0][1]
    return a, cx / (6.0 * a), cy / (6.0 * a)


def shape_centroid(shape):
    """Centroid of a (multi)polygon. Shapefile outer rings run clockwise and
    holes anticlockwise, so summing signed areas subtracts holes for free."""
    parts = list(shape.parts) + [len(shape.points)]
    total = sx = sy = 0.0
    for start, end in zip(parts, parts[1:]):
        a, cx, cy = ring_area_centroid(shape.points[start:end])
        total += a
        sx += cx * a
        sy += cy * a
    if total == 0:
        xs = [p[0] for p in shape.points]
        ys = [p[1] for p in shape.points]
        return abs(total), sum(xs) / len(xs), sum(ys) / len(ys)
    return abs(total), sx / total, sy / total


def sql_str(value):
    return "'" + value.replace("'", "''") + "'"


def main(shp_path, out_path):
    reader = shapefile.Reader(shp_path, encoding="cp1252")
    subs = []
    for sr in reader.iterShapeRecords():
        rec = sr.record.as_dict()
        area, lng, lat = shape_centroid(sr.shape)
        sp_code = str(int(rec["SP_CODE"]))
        subs.append(
            {
                "sp_code": sp_code,
                "mp_code": str(int(rec["MP_CODE"])),
                "name": rec["SP_NAME"].strip(),
                "mp_name": rec["MP_NAME"].strip(),
                "muni": rec["MN_NAME"].strip(),
                "province": PROVINCES[sp_code[0]],
                "area": area,
                "lat": lat,
                "lng": lng,
            }
        )

    by_main = collections.defaultdict(list)
    for s in subs:
        by_main[s["mp_code"]].append(s)

    rows = []
    main_index = {}
    for mp_code, members in by_main.items():
        weight = sum(m["area"] for m in members) or 1.0
        mlat = sum(m["lat"] * m["area"] for m in members) / weight
        mlng = sum(m["lng"] * m["area"] for m in members) / weight
        first = members[0]
        main_id = f"MP{mp_code}"
        main_index[(first["mp_name"], first["muni"])] = main_id
        rows.append(
            (main_id, "main", first["mp_name"], main_id, first["mp_name"], first["muni"],
             first["province"], mlat, mlng, mlat, mlng)
        )
        for m in members:
            if m["name"].endswith(" SP") or m["name"] == m["mp_name"]:
                continue  # the unnamed remainder of the main place — covered by its row
            rows.append(
                (f"SP{m['sp_code']}", "sub", m["name"], main_id, m["mp_name"], m["muni"],
                 m["province"], m["lat"], m["lng"], mlat, mlng)
            )

    for slug, key in LEGACY_AREAS.items():
        if key not in main_index:
            sys.exit(f"Legacy area {slug!r} has no main place match for {key}")

    with open(out_path, "w", encoding="utf-8") as out:
        out.write(
            "-- Generated by scripts/places/build_statssa_places.py — do not edit by hand.\n"
            "-- Place data: Statistics South Africa, Census 2011.\n\n"
            'CREATE TABLE "Place" (\n'
            '    "id" TEXT NOT NULL,\n'
            '    "kind" TEXT NOT NULL,\n'
            '    "name" TEXT NOT NULL,\n'
            '    "mainPlaceId" TEXT NOT NULL,\n'
            '    "mainPlaceName" TEXT NOT NULL,\n'
            '    "municipality" TEXT NOT NULL,\n'
            '    "province" TEXT NOT NULL,\n'
            '    "lat" DOUBLE PRECISION NOT NULL,\n'
            '    "lng" DOUBLE PRECISION NOT NULL,\n'
            '    "mainLat" DOUBLE PRECISION NOT NULL,\n'
            '    "mainLng" DOUBLE PRECISION NOT NULL,\n'
            '    "searchText" TEXT NOT NULL,\n'
            '    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")\n'
            ");\n"
            'CREATE INDEX "Place_mainPlaceId_idx" ON "Place"("mainPlaceId");\n\n'
        )
        batch = 1000
        for i in range(0, len(rows), batch):
            out.write(
                'INSERT INTO "Place" ("id","kind","name","mainPlaceId","mainPlaceName",'
                '"municipality","province","lat","lng","mainLat","mainLng","searchText") VALUES\n'
            )
            values = []
            for (pid, kind, name, main_id, mp_name, muni, prov, lat, lng, mlat, mlng) in rows[i : i + batch]:
                search = " ".join(dict.fromkeys([name, mp_name, muni])).lower()
                values.append(
                    f"({sql_str(pid)},{sql_str(kind)},{sql_str(name)},{sql_str(main_id)},"
                    f"{sql_str(mp_name)},{sql_str(muni)},{sql_str(prov)},"
                    f"{lat:.4f},{lng:.4f},{mlat:.4f},{mlng:.4f},{sql_str(search)})"
                )
            out.write(",\n".join(values) + ";\n")

        out.write(
            '\n-- Move existing circles from the old fixed areas onto their main place.\n'
            'ALTER TABLE "Circle" ADD COLUMN "placeId" TEXT;\n'
        )
        for slug, key in LEGACY_AREAS.items():
            out.write(
                f'UPDATE "Circle" SET "placeId" = {sql_str(main_index[key])} '
                f'WHERE "areaSlug" = {sql_str(slug)};\n'
            )
        out.write(
            "-- Anything else (shouldn't exist — the old form only offered the ten above)\n"
            "-- lands on Soweto rather than failing the deploy.\n"
            f'UPDATE "Circle" SET "placeId" = {sql_str(main_index[LEGACY_AREAS["soweto"]])} '
            'WHERE "placeId" IS NULL;\n'
            'ALTER TABLE "Circle" ALTER COLUMN "placeId" SET NOT NULL;\n'
            'DROP INDEX "Circle_areaSlug_idx";\n'
            'ALTER TABLE "Circle" DROP COLUMN "areaSlug";\n'
            'CREATE INDEX "Circle_placeId_idx" ON "Circle"("placeId");\n'
            'ALTER TABLE "Circle" ADD CONSTRAINT "Circle_placeId_fkey" FOREIGN KEY ("placeId") '
            'REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;\n'
        )

    kinds = collections.Counter(r[1] for r in rows)
    print(f"wrote {len(rows)} places ({kinds['main']} main, {kinds['sub']} sub) to {out_path}")
    for slug, key in LEGACY_AREAS.items():
        print(f"  {slug:12} -> {main_index[key]}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
