import { NextResponse } from "next/server";
import { adminCookieValue } from "../../../../lib/auth.js";

export async function POST(request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "admin login is not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body.password !== password) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("vt_admin", adminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
