import { NextResponse } from "next/server";
import { KEYS, getPlaces, storeGet } from "../../../lib/store.js";
import { buildStatus } from "../../../lib/status.js";

// Public endpoint. It deliberately returns only the derived status text,
// never raw coordinates.
export async function GET() {
  const [sleep, raw, places] = await Promise.all([
    storeGet(KEYS.sleep),
    storeGet(KEYS.rawLocation),
    getPlaces(),
  ]);
  return NextResponse.json(buildStatus({ sleep, raw, places }));
}
