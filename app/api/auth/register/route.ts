import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  hashPassword,
  isValidEmail,
} from "@/lib/auth";
import { errorResponse } from "@/lib/api-errors";

const MIN_PASSWORD_LENGTH = 8;

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

  if (!isValidEmail(email)) {
    return errorResponse(400, "invalid_email", "A valid email is required.");
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return errorResponse(
      400,
      "invalid_password",
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, isAdmin: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return errorResponse(
        409,
        "email_taken",
        "An account with this email already exists."
      );
    }
    throw err;
  }

  const token = await createSessionToken({
    userId: user.id,
    isAdmin: user.isAdmin,
  });

  const response = NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
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
