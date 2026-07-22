import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

function makeRequest(query: string) {
  return new Request(`http://localhost/api/properties${query}`);
}

const sampleRow = {
  id: "prop_1",
  title: "2BHK in Adajan",
  price: 450000000,
  bedrooms: 2,
  type: "apartment",
  location: "Adajan, Surat",
  latitude: 21.1953,
  longitude: 72.7871,
  photos: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("GET /api/properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.property.findMany).mockResolvedValue([sampleRow] as never);
    vi.mocked(prisma.property.count).mockResolvedValue(1 as never);
  });

  it("always filters to published status, defaults sort/page/pageSize", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(200);

    const call = vi.mocked(prisma.property.findMany).mock.calls[0][0]!;
    expect(call.where).toMatchObject({ status: "published" });
    expect(call.orderBy).toEqual({ createdAt: "desc" });
    expect(call.skip).toBe(0);
    expect(call.take).toBe(20);
  });

  it("derives thumbnailUrl from the first photo and serializes createdAt", async () => {
    const res = await GET(makeRequest(""));
    const json = await res.json();
    expect(json.results[0].thumbnailUrl).toBe("https://example.com/a.jpg");
    expect(json.results[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(json).toMatchObject({ page: 1, pageSize: 20, total: 1 });
  });

  it("applies type, bedrooms, and price range filters", async () => {
    await GET(makeRequest("?type=villa&bedrooms=3&minPrice=1000000&maxPrice=5000000"));
    const call = vi.mocked(prisma.property.findMany).mock.calls[0][0]!;
    expect(call.where).toMatchObject({
      status: "published",
      type: "villa",
      bedrooms: 3,
      price: { gte: 1000000, lte: 5000000 },
    });
  });

  it("maps sort=price_asc and sort=price_desc correctly", async () => {
    await GET(makeRequest("?sort=price_asc"));
    expect(vi.mocked(prisma.property.findMany).mock.calls[0][0]!.orderBy).toEqual({ price: "asc" });

    await GET(makeRequest("?sort=price_desc"));
    expect(vi.mocked(prisma.property.findMany).mock.calls[1][0]!.orderBy).toEqual({ price: "desc" });
  });

  it("ignores an invalid sort value and falls back to date_desc", async () => {
    await GET(makeRequest("?sort=not_a_real_sort"));
    expect(vi.mocked(prisma.property.findMany).mock.calls[0][0]!.orderBy).toEqual({ createdAt: "desc" });
  });

  it("computes pagination skip/take and caps pageSize at 50", async () => {
    await GET(makeRequest("?page=3&pageSize=20"));
    expect(vi.mocked(prisma.property.findMany).mock.calls[0][0]).toMatchObject({ skip: 40, take: 20 });

    await GET(makeRequest("?pageSize=999"));
    expect(vi.mocked(prisma.property.findMany).mock.calls[1][0]).toMatchObject({ take: 50 });
  });
});
