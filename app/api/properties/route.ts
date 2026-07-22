import { NextResponse } from "next/server";
import { listPublishedProperties } from "@/lib/properties";

function parsePositiveInt(value: string | null): number | undefined {
  const n = Number(value);
  return value !== null && Number.isInteger(n) && n > 0 ? n : undefined;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const bedrooms = Number(params.get("bedrooms"));
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  const result = await listPublishedProperties({
    q: params.get("q"),
    type: params.get("type"),
    bedrooms: Number.isInteger(bedrooms) && bedrooms > 0 ? bedrooms : null,
    minPrice: minPrice !== null ? Number(minPrice) : null,
    maxPrice: maxPrice !== null ? Number(maxPrice) : null,
    sort: params.get("sort"),
    page: parsePositiveInt(params.get("page")),
    pageSize: parsePositiveInt(params.get("pageSize")),
  });

  return NextResponse.json(result);
}
