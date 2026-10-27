import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isAdmin } from "../../../../lib/auth.js";
import { KEYS, getPlaces, storeSet } from "../../../../lib/store.js";
import { PLACE_LABELS } from "../../../../lib/status.js";

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ places: await getPlaces() });
}

export async function POST(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const lat = Number(body.lat);
  const lon = Number(body.lon);
  const radiusMeters = body.radiusMeters != null ? Number(body.radiusMeters) : 100;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    return NextResponse.json({ error: "lat, lon and a positive radiusMeters are required" }, { status: 400 });
  }
  if (!PLACE_LABELS.includes(body.label)) {
    return NextResponse.json({ error: `label must be one of: ${PLACE_LABELS.join(", ")}` }, { status: 400 });
  }

  const places = await getPlaces();
  const place = {
    id: crypto.randomUUID(),
    name: String(body.name || body.label),
    label: body.label,
    lat,
    lon,
    radiusMeters,
    createdAt: new Date().toISOString(),
  };
  places.push(place);
  await storeSet(KEYS.places, places);
  return NextResponse.json({ ok: true, place });
}

export async function DELETE(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const places = (await getPlaces()).filter((p) => p.id !== id);
  await storeSet(KEYS.places, places);
  return NextResponse.json({ ok: true });
}
