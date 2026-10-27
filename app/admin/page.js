"use client";

import { useCallback, useEffect, useState } from "react";

const LABELS = ["lab", "library", "gym", "class", "home", "other"];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [places, setPlaces] = useState([]);
  const [lastLocation, setLastLocation] = useState(null);
  const [browserLocation, setBrowserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [label, setLabel] = useState("lab");
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(100);
  const [source, setSource] = useState("browser");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [placesRes, lastRes] = await Promise.all([
      fetch("/api/admin/places"),
      fetch("/api/admin/last-location"),
    ]);
    if (placesRes.status === 401 || lastRes.status === 401) {
      setAuthed(false);
      return;
    }
    setAuthed(true);
    if (placesRes.ok) setPlaces((await placesRes.json()).places || []);
    if (lastRes.ok) setLastLocation((await lastRes.json()).location);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function login(e) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password, or admin login is not configured.");
      return;
    }
    setPassword("");
    load();
  }

  function useBrowserLocation() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("This browser does not support geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setBrowserLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      () => setGeoError("Could not get your location. Allow location access and try again.")
    );
  }

  async function savePlace(e) {
    e.preventDefault();
    setMessage("");
    const coords = source === "browser" ? browserLocation : lastLocation;
    if (!coords) {
      setMessage("Pick a location source first: browser GPS, or the last OwnTracks report.");
      return;
    }
    const res = await fetch("/api/admin/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || label,
        label,
        lat: coords.lat,
        lon: coords.lon,
        radiusMeters: Number(radius),
      }),
    });
    if (!res.ok) {
      setMessage("Could not save that place.");
      return;
    }
    setMessage(`Saved: ${name.trim() || label}`);
    setName("");
    load();
  }

  async function deletePlace(id) {
    await fetch(`/api/admin/places?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  const field = { display: "block", width: "100%", padding: 10, margin: "6px 0 14px", borderRadius: 8, border: "1px solid #334", background: "#111827", color: "#f2f4f8", boxSizing: "border-box" };
  const button = { padding: "10px 16px", borderRadius: 8, border: 0, background: "#f5c518", color: "#111", fontWeight: 700, cursor: "pointer" };

  if (!authed) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "72px 24px" }}>
        <h1>VedTracker admin</h1>
        <p style={{ opacity: 0.75 }}>This page is private. Enter the admin password to certify places.</p>
        <form onSubmit={login}>
          <label>Admin password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={field} />
          </label>
          <button type="submit" style={button}>Log in</button>
          {loginError && <p style={{ color: "#f87171" }}>{loginError}</p>}
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Certify a place</h1>
        <button onClick={logout} style={{ ...button, background: "#334155", color: "#fff" }}>Log out</button>
      </div>
      <p style={{ opacity: 0.75 }}>
        Stand where you want to certify, grab a location, pick a label, and save it.
        After that, being inside its radius will set your status automatically.
      </p>

      <section style={{ margin: "24px 0" }}>
        <button onClick={useBrowserLocation} style={button}>Use my current (browser) location</button>
        {geoError && <p style={{ color: "#f87171" }}>{geoError}</p>}
        {browserLocation && (
          <p>Browser GPS: {browserLocation.lat.toFixed(6)}, {browserLocation.lon.toFixed(6)}
            {browserLocation.accuracy ? ` (±${Math.round(browserLocation.accuracy)} m)` : ""}</p>
        )}
        {lastLocation && (
          <p>Last OwnTracks report: {lastLocation.lat.toFixed(6)}, {lastLocation.lon.toFixed(6)}
            {lastLocation.accuracy ? ` (±${Math.round(lastLocation.accuracy)} m)` : ""}
            {lastLocation.updatedAt ? ` — ${new Date(lastLocation.updatedAt).toLocaleString()}` : ""}</p>
        )}
      </section>

      <form onSubmit={savePlace}>
        <label>Location source
          <select value={source} onChange={(e) => setSource(e.target.value)} style={field}>
            <option value="browser">Browser GPS (above)</option>
            <option value="owntracks">Last OwnTracks report</option>
          </select>
        </label>
        <label>Label
          <select value={label} onChange={(e) => setLabel(e.target.value)} style={field}>
            {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label>Place name (optional)
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Doe Library" style={field} />
        </label>
        <label>Radius (meters)
          <input type="number" min="10" max="1000" value={radius} onChange={(e) => setRadius(e.target.value)} style={field} />
        </label>
        <button type="submit" style={button}>Save this place</button>
        {message && <p>{message}</p>}
      </form>

      <h2 style={{ marginTop: 40 }}>Certified places</h2>
      {places.length === 0 ? (
        <p style={{ opacity: 0.75 }}>None yet. Certify your first place above.</p>
      ) : (
        <ul>
          {places.map((p) => (
            <li key={p.id} style={{ marginBottom: 12 }}>
              <strong>{p.name}</strong> — {p.label} · {p.radiusMeters} m
              <button onClick={() => deletePlace(p.id)} style={{ marginLeft: 12, background: "transparent", color: "#f87171", border: 0, cursor: "pointer" }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
