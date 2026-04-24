export const SLOT_MINUTES = 60;
export const SLOTS_PER_DAY = 24 * 60 / SLOT_MINUTES;
export const SLOT_MS = SLOT_MINUTES * 60 * 1000;

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function todayDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localMidnightMs(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

export function isMinuteInWindow(minute, start, end) {
  const startMinute = typeof start === "number" ? start : timeToMinutes(start);
  const endMinute = typeof end === "number" ? end : timeToMinutes(end);
  if (startMinute === endMinute) return true;
  if (startMinute < endMinute) return minute >= startMinute && minute < endMinute;
  return minute >= startMinute || minute < endMinute;
}

export function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const result = {};
  formatter.formatToParts(date).forEach((part) => {
    if (part.type !== "literal") result[part.type] = Number(part.value);
  });
  return result;
}

export function getTotalMinutesInZone(utcMs, timezone) {
  const parts = getZonedParts(new Date(utcMs), timezone);
  return parts.hour * 60 + parts.minute;
}

export function formatZonedTime(date, timezone, includeSeconds = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
    hour12: false,
  }).format(date);
}

export function timeOfDayIcon(date, timezone) {
  const minutes = getTotalMinutesInZone(date.getTime(), timezone);
  const hour = Math.floor(minutes / 60);
  if (hour >= 5 && hour < 8) return "◔";
  if (hour >= 8 && hour < 18) return "◉";
  if (hour >= 18 && hour < 21) return "◑";
  return "◌";
}

export function localTimeToUtc(dateStr, timeStr, timezone) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  let utcMs = Date.UTC(year, month - 1, day, hours, minutes);

  for (let i = 0; i < 4; i += 1) {
    const parts = getZonedParts(new Date(utcMs), timezone);
    const diff =
      Date.UTC(year, month - 1, day, hours, minutes) -
      Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    if (Math.abs(diff) < 60000) break;
    utcMs += diff;
  }

  return utcMs;
}

export function formatShortDate(parts) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parts.month - 1]} ${parts.day}`;
}

export function buildTimeline(dateString, zones) {
  const startMs = localMidnightMs(dateString);
  const highlightedZones = zones.filter((zone) => zone.highlighted);
  const overlapSlots = new Set();
  const zoneSlots = new Map();

  zones.forEach((zone) => {
    const slots = new Set();
    if (zone.highlighted) {
      for (let slot = 0; slot < SLOTS_PER_DAY; slot += 1) {
        const utcMs = startMs + slot * SLOT_MS;
        const zoneMinute = getTotalMinutesInZone(utcMs, zone.timezone);
        if (isMinuteInWindow(zoneMinute, zone.start, zone.end)) slots.add(slot);
      }
    }
    zoneSlots.set(zone.id, slots);
  });

  if (highlightedZones.length >= 2) {
    for (let slot = 0; slot < SLOTS_PER_DAY; slot += 1) {
      const utcMs = startMs + slot * SLOT_MS;
      const everyZoneFits = highlightedZones.every((zone) => {
        const zoneMinute = getTotalMinutesInZone(utcMs, zone.timezone);
        return isMinuteInWindow(zoneMinute, zone.start, zone.end);
      });
      if (everyZoneFits) overlapSlots.add(slot);
    }
  }

  return { startMs, zoneSlots, overlapSlots };
}

export function getSlotSegments(slotSet) {
  const slots = [...slotSet].sort((a, b) => a - b);
  if (!slots.length) return [];

  const segments = [];
  let start = slots[0];
  let previous = slots[0];

  for (const slot of slots.slice(1)) {
    if (slot === previous + 1) {
      previous = slot;
    } else {
      segments.push({ start, end: previous + 1 });
      start = slot;
      previous = slot;
    }
  }
  segments.push({ start, end: previous + 1 });

  if (segments.length > 1 && segments[0].start === 0 && segments.at(-1).end === SLOTS_PER_DAY) {
    const first = segments.shift();
    const last = segments.pop();
    segments.unshift({ start: last.start, end: first.end });
  }

  return segments;
}

export function formatSegmentsForZone(segments, startMs, timezone) {
  return segments.map(({ start, end }) => {
    const startMinute = getTotalMinutesInZone(startMs + start * SLOT_MS, timezone);
    const endMinute = getTotalMinutesInZone(startMs + end * SLOT_MS, timezone);
    return `${minutesToTime(startMinute)}-${minutesToTime(endMinute)}`;
  }).join(", ");
}

export function tzOffsetMinutes(date, timezone) {
  const parts = getZonedParts(date, timezone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}
