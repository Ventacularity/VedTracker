import { Redis } from "@upstash/redis";

// Storage keys in Upstash (or the in-memory fallback for local dev).
export const KEYS = {
  rawLocation: "vedtracker:raw-location",
  sleep: "vedtracker:sleep",
  places: "vedtracker:places",
};

let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback: only for local development. On Vercel, serverless
// functions do not share memory, so Upstash is required in production.
const memory = new Map();

export async function storeGet(key) {
  if (redis) return await redis.get(key);
  return memory.has(key) ? memory.get(key) : null;
}

export async function storeSet(key, value) {
  if (redis) await redis.set(key, value);
  else memory.set(key, value);
}

export async function getPlaces() {
  const places = await storeGet(KEYS.places);
  return Array.isArray(places) ? places : [];
}
