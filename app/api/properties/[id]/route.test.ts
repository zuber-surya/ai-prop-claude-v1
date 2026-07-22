import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findFirst: vi.fn(),
    },
  },
}));

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/properties/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the full record for a published property", async () => {
    const property = {
      id: "prop_1",
      title: "2BHK in Adajan",
      description: "Bright and airy",
      price: 450000000,
      status: "published",
    };
    vi.mocked(prisma.property.findFirst).mockResolvedValue(property as never);

    const res = await GET(new Request("http://localhost/api/properties/prop_1"), ctx("prop_1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(property);

    expect(prisma.property.findFirst).toHaveBeenCalledWith({
      where: { id: "prop_1", status: "published" },
    });
  });

  it("returns 404 when the property doesn't exist", async () => {
    vi.mocked(prisma.property.findFirst).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/properties/nope"), ctx("nope"));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("not_found");
  });

  it("returns 404 for an unpublished (draft) property, not the record", async () => {
    // findFirst's where already excludes drafts, so a draft-only id resolves to null.
    vi.mocked(prisma.property.findFirst).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/properties/draft_1"), ctx("draft_1"));
    expect(res.status).toBe(404);
  });
});
