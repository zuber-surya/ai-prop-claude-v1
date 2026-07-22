import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user and sets a session cookie on success", async () => {
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user_1",
      email: "test@example.com",
      isAdmin: false,
    } as never);

    const res = await POST(
      makeRequest({ email: "test@example.com", password: "password123" })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({ id: "user_1", email: "test@example.com" });

    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeTruthy();
    const session = await verifySessionToken(cookie!.value);
    expect(session).toEqual({ userId: "user_1", isAdmin: false });
  });

  it("returns 409 when the email is already registered", async () => {
    vi.mocked(prisma.user.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      })
    );

    const res = await POST(
      makeRequest({ email: "dup@example.com", password: "password123" })
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.code).toBe("email_taken");
  });

  it("returns 400 for an invalid email", async () => {
    const res = await POST(
      makeRequest({ email: "not-an-email", password: "password123" })
    );
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 400 for a too-short password", async () => {
    const res = await POST(
      makeRequest({ email: "test@example.com", password: "short" })
    );
    expect(res.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
