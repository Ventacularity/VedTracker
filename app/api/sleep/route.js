import { NextResponse } from "next/server";
import { checkIngest } from "../../../lib/auth.js";
import { KEYS, storeSet } from "../../../lib/store.js";

// Sleep Focus endpoint. Two iOS Personal Automations call this:
//  - Sleep Focus turns ON  -> POST {"sleeping": true}
//  - Sleep Focus turns OFF -> POST {"sleeping": false}
// Authenticate with the x-vedtracker-secret header = INGEST_SECRET.
// While sleeping is true, /api/status reports "sleeping" regardless of location.
export async function POST(request) {
  if (!checkIngest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (typeof body.sleeping !== "boolean") {
    return NextResponse.json({ error: "sleeping must be true or false" }, { status: 400 });
  }

  await storeSet(KEYS.sleep, { sleeping: body.sleeping, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, sleeping: body.sleeping });
}
