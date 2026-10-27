import crypto from "node:crypto";

// --- Ingest auth (OwnTracks + Sleep Focus Shortcuts) ---
// Accepts, in order: Bearer token, HTTP Basic password, or x-vedtracker-secret.
// OwnTracks HTTP mode uses Basic auth, so set the OwnTracks password to INGEST_SECRET.
export function checkIngest(request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) return false;

  const headerSecret = request.headers.get("x-vedtracker-secret");
  if (headerSecret && headerSecret === secret) return true;

  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice("Bearer ".length) === secret;
  if (auth.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(auth.slice("Basic ".length), "base64").toString("utf8");
      const password = decoded.slice(decoded.indexOf(":") + 1);
      return password === secret;
    } catch {
      return false;
    }
  }
  return false;
}

// --- Admin auth (/admin page) ---
// The login cookie is an HMAC of a fixed string, keyed by ADMIN_PASSWORD.
// It reveals nothing about the password itself.
export function adminCookieValue() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto.createHmac("sha256", password).update("vedtracker-admin").digest("hex");
}

export function isAdmin(request) {
  const expected = adminCookieValue();
  if (!expected) return false;
  const cookie = request.cookies.get("vt_admin")?.value;
  if (!cookie || cookie.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(expected));
  } catch {
    return false;
  }
}
