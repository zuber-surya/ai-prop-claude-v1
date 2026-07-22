import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-errors";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, status: "published" },
  });

  if (!property) {
    return errorResponse(404, "not_found", "Property not found.");
  }

  return NextResponse.json(property);
}
