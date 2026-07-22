import { describe, it, expect } from "vitest";
import { POST } from "./route";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const res = await POST();
    expect(res.status).toBe(200);

    const setCookieHeader = res.headers.get("set-cookie") ?? "";
    expect(setCookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookieHeader.toLowerCase()).toMatch(/expires=|max-age=0/);
  });
});
