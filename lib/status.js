import { matchPlace } from "./geo.js";

export const PLACE_LABELS = ["lab", "library", "gym", "class", "home", "other"];

const ACTIVITY_TEXT = {
  lab: "working in the lab",
  library: "studying",
  gym: "at the gym",
  class: "in class",
  home: "at home",
  other: "out",
};

// Sleeping always wins over location: Sleep Focus is the live signal,
// and it is cleared by the matching "Sleep Focus off" Shortcut.
export function buildStatus({ sleep, raw, places }) {
  if (sleep?.sleeping) {
    return {
      sleeping: true,
      statusText: "sleeping",
      activity: "sleeping",
      place: null,
      placeLabel: null,
      updatedAt: sleep.updatedAt || null,
      stale: false,
    };
  }

  if (!raw || typeof raw.lat !== "number" || typeof raw.lon !== "number") {
    return {
      sleeping: false,
      statusText: "not sharing yet",
      activity: null,
      place: null,
      placeLabel: null,
      updatedAt: null,
      stale: true,
    };
  }

  const matched = matchPlace(raw.lat, raw.lon, places);
  const updatedAt = raw.updatedAt || null;
  const stale = updatedAt ? Date.now() - new Date(updatedAt).getTime() > 20 * 60 * 1000 : true;

  if (matched) {
    const { place } = matched;
    return {
      sleeping: false,
      statusText: ACTIVITY_TEXT[place.label] || (place.name ? `at ${place.name}` : "out"),
      activity: ACTIVITY_TEXT[place.label] || null,
      place: place.name || place.label,
      placeLabel: place.label,
      updatedAt,
      stale,
    };
  }

  return {
    sleeping: false,
    statusText: "out and about",
    activity: "out and about",
    place: null,
    placeLabel: null,
    updatedAt,
    stale,
  };
}
