import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

const SORT_MAP: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  date_desc: { createdAt: "desc" },
};

export interface PropertyListFilters {
  q?: string | null;
  type?: string | null;
  bedrooms?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: string | null;
  page?: number;
  pageSize?: number;
}

export interface PropertyListItem {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface PropertyListResult {
  results: PropertyListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export async function listPublishedProperties(
  filters: PropertyListFilters
): Promise<PropertyListResult> {
  const sort =
    filters.sort && filters.sort in SORT_MAP ? filters.sort : "date_desc";
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = Math.min(
    filters.pageSize && filters.pageSize > 0
      ? filters.pageSize
      : DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const where: Prisma.PropertyWhereInput = { status: "published" };

  if (filters.q) {
    where.location = { contains: filters.q, mode: "insensitive" };
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.bedrooms && filters.bedrooms > 0) {
    // "3 bedrooms" in a property search almost always means "3 or more" -
    // API_CONTRACT.md §1 doesn't specify exact-match vs. minimum, so this
    // reads bedrooms as a minimum (gte), matching standard real-estate
    // search UX rather than requiring an exact match.
    where.bedrooms = { gte: filters.bedrooms };
  }
  if (
    (filters.minPrice != null && Number.isFinite(filters.minPrice)) ||
    (filters.maxPrice != null && Number.isFinite(filters.maxPrice))
  ) {
    where.price = {};
    if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
      where.price.lte = filters.maxPrice;
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

  const results: PropertyListItem[] = rows.map((p) => ({
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

  return { results, page, pageSize, total };
}

export async function getPublishedProperty(id: string) {
  return prisma.property.findFirst({
    where: { id, status: "published" },
  });
}
