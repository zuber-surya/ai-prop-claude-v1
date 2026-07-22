import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  isValidEmail,
  verifyPassword,
} from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

// A valid bcrypt hash of a value nobody can type, used to equalize compare
// timing when no user is found (see below).
const DUMMY_PASSWORD_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeOgxCz.uW6Bh4CmMdE1pB6WVeChKlKlHu";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_body", "Request body must be JSON.");
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (!isValidEmail(email) || typeof password !== "string") {
    return errorResponse(
      401,
      "invalid_credentials",
      "Invalid email or password."
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always run the bcrypt comparison, even for a nonexistent user, against a
  // dummy hash - otherwise response timing would leak whether the email is
  // registered.
  const passwordValid = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !passwordValid) {
    return errorResponse(
      401,
      "invalid_credentials",
      "Invalid email or password."
    );
  }

  const token = await createSessionToken({
    userId: user.id,
    isAdmin: user.isAdmin,
  });

  const response = NextResponse.json(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    { status: 200 }
  );
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
