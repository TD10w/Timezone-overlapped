import { WORLD_CITIES } from "../data/world.js";

export function normalizeLookupValue(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_/-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function searchCities(query, limit = 8) {
  const q = normalizeLookupValue(query);
  if (!q) return [];

  const scored = [];
  for (const city of WORLD_CITIES) {
    const fields = [
      city.name,
      city.country,
      city.tz,
      ...(city.aliases || []),
      ...(city.keywords || []),
    ].map(normalizeLookupValue);

    let score = 0;
    fields.forEach((field, index) => {
      if (field === q) score = Math.max(score, 120 - index);
      else if (field.startsWith(q)) score = Math.max(score, 90 - index);
      else if (field.includes(q)) score = Math.max(score, 60 - index);
    });

    if (score > 0) scored.push({ city, score });
  }

  scored.sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name));
  return scored.slice(0, limit).map(({ city }) => city);
}

export function nearestCity(lat, lon) {
  let best = null;
  let bestD = Infinity;
  for (const city of WORLD_CITIES) {
    const d = greatCircleDistance(lat, lon, city.lat, city.lon);
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}

function greatCircleDistance(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(a));
}
