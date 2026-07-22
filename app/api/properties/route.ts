import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const SORT_MAP: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  date_desc: { createdAt: "desc" },
};

function parsePositiveInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return value !== null && Number.isInteger(n) && n > 0 ? n : fallback;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const q = params.get("q");
  const type = params.get("type");
  const sortParam = params.get("sort");
  const sort = sortParam && sortParam in SORT_MAP ? sortParam : "date_desc";

  const page = parsePositiveInt(params.get("page"), 1);
  const pageSize = Math.min(
    parsePositiveInt(params.get("pageSize"), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  const where: Prisma.PropertyWhereInput = { status: "published" };

  if (q) {
    where.location = { contains: q, mode: "insensitive" };
  }
  if (type) {
    where.type = type;
  }

  const bedrooms = Number(params.get("bedrooms"));
  if (Number.isInteger(bedrooms) && bedrooms > 0) {
    where.bedrooms = bedrooms;
  }

  // minPrice/maxPrice are in the same unit as the stored/returned `price`
  // field - INR paise (SCHEMA.md §3) - not rupees.
  const minPrice = Number(params.get("minPrice"));
  const maxPrice = Number(params.get("maxPrice"));
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.price = {};
    if (params.get("minPrice") !== null && Number.isFinite(minPrice)) {
      where.price.gte = minPrice;
    }
    if (params.get("maxPrice") !== null && Number.isFinite(maxPrice)) {
      where.price.lte = maxPrice;
    }
  }

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: SORT_MAP[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        price: true,
        bedrooms: true,
        type: true,
        location: true,
        latitude: true,
        longitude: true,
        photos: true,
        createdAt: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  const results = rows.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    bedrooms: p.bedrooms,
    type: p.type,
    location: p.location,
    latitude: p.latitude,
    longitude: p.longitude,
    thumbnailUrl: p.photos[0] ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return NextResponse.json({ results, page, pageSize, total });
}
