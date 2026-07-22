import { NextResponse } from "next/server";
import { getPublishedProperty } from "@/lib/properties";
import { errorResponse } from "@/lib/api-errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const property = await getPublishedProperty(id);

  if (!property) {
    return errorResponse(404, "not_found", "Property not found.");
  }

  return NextResponse.json(property);
}
