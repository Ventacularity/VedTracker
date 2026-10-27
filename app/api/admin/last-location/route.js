import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/auth.js";
import { KEYS, storeGet } from "../../../../lib/store.js";

// Admin-only: the latest raw location, for certifying a place from the
// last OwnTracks report instead of live browser GPS.
export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const raw = await storeGet(KEYS.rawLocation);
  return NextResponse.json({ location: raw });
}
