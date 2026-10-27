// Distance between two lat/lon points, in meters (haversine formula).
export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Return the best matching place, or null.
// A place matches when the point is inside its radius. If several match
// (common on a dense campus), the closest relative to its radius wins.
export function matchPlace(lat, lon, places) {
  let best = null;
  for (const place of places || []) {
    if (typeof place.lat !== "number" || typeof place.lon !== "number") continue;
    const radius = place.radiusMeters || 100;
    const distance = distanceMeters(lat, lon, place.lat, place.lon);
    if (distance > radius) continue;
    const score = distance / radius;
    if (!best || score < best.score) best = { place, distance, score };
  }
  return best;
}
