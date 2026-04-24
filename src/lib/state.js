import { todayDateString } from "./time.js";

export const STORAGE_KEY = "timezone-overlap:v1";

const DEFAULT_GLOBE = {
  style: "wireframe",
  rotationMode: "spin",
  infoDensity: "detailed",
  localHidden: false,
};

export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function createDefaultState(localTimezone = getLocalTimezone(), now = new Date()) {
  return {
    version: 1,
    date: todayDateString(now),
    zones: [
      {
        id: "local",
        timezone: localTimezone,
        label: "Local time",
        start: "09:00",
        end: "17:00",
        highlighted: true,
      },
      {
        id: "zone-america-new-york",
        timezone: "America/New_York",
        label: "New York",
        start: "09:00",
        end: "17:00",
        highlighted: true,
        sourceCityId: "new-york-us",
      },
    ],
    translator: {
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      sourceTimezone: localTimezone,
    },
    globe: { ...DEFAULT_GLOBE },
  };
}

export function normalizeState(value, fallback = createDefaultState()) {
  if (!value || typeof value !== "object") return fallback;
  const zones = Array.isArray(value.zones) ? value.zones : fallback.zones;
  const normalizedZones = zones
    .filter((zone) => zone && typeof zone.timezone === "string")
    .map((zone, index) => ({
      id: typeof zone.id === "string" ? zone.id : `zone-${index}-${zone.timezone.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      timezone: zone.timezone,
      label: typeof zone.label === "string" ? zone.label : zone.timezone.split("/").pop().replace(/_/g, " "),
      start: typeof zone.start === "string" ? zone.start : "09:00",
      end: typeof zone.end === "string" ? zone.end : "17:00",
      highlighted: typeof zone.highlighted === "boolean" ? zone.highlighted : true,
      sourceCityId: typeof zone.sourceCityId === "string" ? zone.sourceCityId : undefined,
    }));

  if (!normalizedZones.some((zone) => zone.id === "local")) {
    normalizedZones.unshift(fallback.zones[0]);
  }

  return {
    version: 1,
    date: typeof value.date === "string" ? value.date : fallback.date,
    zones: normalizedZones,
    translator: {
      time: value.translator?.time || fallback.translator.time,
      sourceTimezone: value.translator?.sourceTimezone || fallback.translator.sourceTimezone,
    },
    globe: {
      ...DEFAULT_GLOBE,
      ...(value.globe && typeof value.globe === "object" ? value.globe : {}),
    },
  };
}

export function encodeState(state) {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeState(encoded) {
  if (!encoded) return null;
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function loadInitialState() {
  const fallback = createDefaultState();
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("state");

  if (encoded) {
    try {
      const state = normalizeState(decodeState(encoded), fallback);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    } catch {
      // Ignore bad shared links and continue to local storage.
    }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeState(JSON.parse(stored), fallback);
  } catch {
    // Ignore unavailable storage.
  }

  return fallback;
}

export function persistState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is best-effort only.
  }
}

export function buildShareUrl(state) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("state", encodeState(state));
  return url.toString();
}
