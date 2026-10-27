import { NextResponse } from "next/server";
import { checkIngest } from "../../../lib/auth.js";
import { KEYS, storeSet } from "../../../lib/store.js";

// OwnTracks HTTP mode endpoint.
// Point OwnTracks at: https://<your-site>/api/location
// with HTTP Basic auth, password = INGEST_SECRET.
// OwnTracks posts {"_type":"location","lat":...,"lon":...,"tst":...,"acc":...}.
// Other OwnTracks message types are ignored. Raw coordinates are stored
// for admin calibration only; /api/status never exposes them.
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
  if (Array.isArray(body)) body = body[0];
  if (!body || (body._type && body._type !== "location")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const lat = Number(body.lat);
  const lon = Number(body.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "missing lat/lon" }, { status: 400 });
  }

  const updatedAt = body.tst
    ? new Date(Number(body.tst) * 1000).toISOString()
    : new Date().toISOString();

  await storeSet(KEYS.rawLocation, {
    lat,
    lon,
    accuracy: body.acc != null ? Number(body.acc) : null,
    updatedAt,
  });
  return NextResponse.json({ ok: true });
}
