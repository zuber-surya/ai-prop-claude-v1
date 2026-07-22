import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, hashPassword, verifySessionToken } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and sets a session cookie with correct credentials", async () => {
    const passwordHash = await hashPassword("password123");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      passwordHash,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const res = await POST(
      makeRequest({ email: "test@example.com", password: "password123" })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ id: "user_1", email: "test@example.com", isAdmin: true });

    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    const session = await verifySessionToken(cookie!.value);
    expect(session).toEqual({ userId: "user_1", isAdmin: true });
  });

  it("returns 401 for a wrong password", async () => {
    const passwordHash = await hashPassword("password123");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      passwordHash,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const res = await POST(
      makeRequest({ email: "test@example.com", password: "wrong-password" })
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("invalid_credentials");
  });

  it("returns 401 for a nonexistent user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await POST(
      makeRequest({ email: "nobody@example.com", password: "password123" })
    );

    expect(res.status).toBe(401);
  });
});
