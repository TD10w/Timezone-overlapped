// ─── DOM refs ─────────────────────────────────────────────────────────────────
const addTzInput       = document.querySelector("#add-tz-input");
const addTzValue       = document.querySelector("#add-tz-value");
const addBtn           = document.querySelector("#add-btn");
const liveClockEl      = document.querySelector("#live-clock");
const liveDateEl       = document.querySelector("#live-date");
const zoneChipsEl      = document.querySelector("#zone-chips");
const timelineEl       = document.querySelector("#timeline-matrix");
const summaryEl        = document.querySelector("#overlap-summary");
const tzOptions        = document.querySelector("#timezone-options");
const addZoneFeedbackEl = document.querySelector("#add-zone-feedback");
const translateTimeEl  = document.querySelector("#translate-time");
const translateTzInput = document.querySelector("#translate-tz-input");
const translateTzValue = document.querySelector("#translate-tz-value");
const translateDateEl  = document.querySelector("#translate-date");
const translateResults = document.querySelector("#translate-results");

// ─── Constants ────────────────────────────────────────────────────────────────
const HOUR_MS = 60 * 60 * 1000;

const DEFAULTS = [
  "America/New_York",
];

// ─── State ────────────────────────────────────────────────────────────────────
const timezoneIndex = [];
let zones = []; // [{ id: number, timezone: string }]
let nextId = 0;
let lastRenderedHour = -1;
const localZone = { start: "09:00", end: "17:00", isHighlighted: true, timezone: "" };

window.getTimezoneZones = getZonesSnapshot;
window.removeZoneByTimezone = removeZoneByTimezone;

// ─── City / country alias map ─────────────────────────────────────────────────
const cityAliasMap = {
  // ── China ────────────────────────────────────────────────────────────────
  china: "Asia/Shanghai",
  shenzhen: "Asia/Shanghai",
  beijing: "Asia/Shanghai",
  shanghai: "Asia/Shanghai",
  guangzhou: "Asia/Shanghai",
  chengdu: "Asia/Shanghai",
  hangzhou: "Asia/Shanghai",
  wuhan: "Asia/Shanghai",
  xian: "Asia/Shanghai",
  "xi an": "Asia/Shanghai",
  nanjing: "Asia/Shanghai",
  suzhou: "Asia/Shanghai",
  hongkong: "Asia/Hong_Kong",
  "hong kong": "Asia/Hong_Kong",
  hk: "Asia/Hong_Kong",

  // ── East Asia ─────────────────────────────────────────────────────────────
  taiwan: "Asia/Taipei",
  taipei: "Asia/Taipei",
  japan: "Asia/Tokyo",
  tokyo: "Asia/Tokyo",
  osaka: "Asia/Tokyo",
  kyoto: "Asia/Tokyo",
  yokohama: "Asia/Tokyo",
  "south korea": "Asia/Seoul",
  korea: "Asia/Seoul",
  seoul: "Asia/Seoul",
  busan: "Asia/Seoul",
  mongolia: "Asia/Ulaanbaatar",
  ulaanbaatar: "Asia/Ulaanbaatar",

  // ── Southeast Asia ────────────────────────────────────────────────────────
  singapore: "Asia/Singapore",
  thailand: "Asia/Bangkok",
  bangkok: "Asia/Bangkok",
  vietnam: "Asia/Ho_Chi_Minh",
  "ho chi minh": "Asia/Ho_Chi_Minh",
  saigon: "Asia/Ho_Chi_Minh",
  hanoi: "Asia/Ho_Chi_Minh",
  indonesia: "Asia/Jakarta",
  jakarta: "Asia/Jakarta",
  bali: "Asia/Makassar",
  philippines: "Asia/Manila",
  manila: "Asia/Manila",
  malaysia: "Asia/Kuala_Lumpur",
  "kuala lumpur": "Asia/Kuala_Lumpur",
  kl: "Asia/Kuala_Lumpur",
  myanmar: "Asia/Yangon",
  yangon: "Asia/Yangon",
  rangoon: "Asia/Yangon",
  cambodia: "Asia/Phnom_Penh",
  "phnom penh": "Asia/Phnom_Penh",
  laos: "Asia/Vientiane",
  vientiane: "Asia/Vientiane",

  // ── South Asia ────────────────────────────────────────────────────────────
  india: "Asia/Kolkata",
  delhi: "Asia/Kolkata",
  "new delhi": "Asia/Kolkata",
  mumbai: "Asia/Kolkata",
  kolkata: "Asia/Kolkata",
  bangalore: "Asia/Kolkata",
  bengaluru: "Asia/Kolkata",
  hyderabad: "Asia/Kolkata",
  chennai: "Asia/Kolkata",
  pakistan: "Asia/Karachi",
  karachi: "Asia/Karachi",
  lahore: "Asia/Karachi",
  islamabad: "Asia/Karachi",
  bangladesh: "Asia/Dhaka",
  dhaka: "Asia/Dhaka",
  "sri lanka": "Asia/Colombo",
  colombo: "Asia/Colombo",
  nepal: "Asia/Kathmandu",
  kathmandu: "Asia/Kathmandu",

  // ── Central / West Asia ───────────────────────────────────────────────────
  iran: "Asia/Tehran",
  tehran: "Asia/Tehran",
  afghanistan: "Asia/Kabul",
  kabul: "Asia/Kabul",
  uae: "Asia/Dubai",
  "united arab emirates": "Asia/Dubai",
  dubai: "Asia/Dubai",
  "abu dhabi": "Asia/Dubai",
  "saudi arabia": "Asia/Riyadh",
  riyadh: "Asia/Riyadh",
  qatar: "Asia/Qatar",
  doha: "Asia/Qatar",
  kuwait: "Asia/Kuwait",
  bahrain: "Asia/Bahrain",
  oman: "Asia/Muscat",
  muscat: "Asia/Muscat",
  iraq: "Asia/Baghdad",
  baghdad: "Asia/Baghdad",
  israel: "Asia/Jerusalem",
  jerusalem: "Asia/Jerusalem",
  "tel aviv": "Asia/Jerusalem",
  jordan: "Asia/Amman",
  amman: "Asia/Amman",
  lebanon: "Asia/Beirut",
  beirut: "Asia/Beirut",
  kazakhstan: "Asia/Almaty",
  almaty: "Asia/Almaty",
  uzbekistan: "Asia/Tashkent",
  tashkent: "Asia/Tashkent",
  azerbaijan: "Asia/Baku",
  baku: "Asia/Baku",
  georgia: "Asia/Tbilisi",
  tbilisi: "Asia/Tbilisi",
  armenia: "Asia/Yerevan",
  yerevan: "Asia/Yerevan",

  // ── Oceania ───────────────────────────────────────────────────────────────
  australia: "Australia/Sydney",
  sydney: "Australia/Sydney",
  melbourne: "Australia/Melbourne",
  brisbane: "Australia/Brisbane",
  perth: "Australia/Perth",
  adelaide: "Australia/Adelaide",
  darwin: "Australia/Darwin",
  "new zealand": "Pacific/Auckland",
  auckland: "Pacific/Auckland",
  wellington: "Pacific/Auckland",
  fiji: "Pacific/Fiji",

  // ── Europe ────────────────────────────────────────────────────────────────
  uk: "Europe/London",
  england: "Europe/London",
  britain: "Europe/London",
  "great britain": "Europe/London",
  "united kingdom": "Europe/London",
  london: "Europe/London",
  manchester: "Europe/London",
  birmingham: "Europe/London",
  edinburgh: "Europe/London",
  ireland: "Europe/Dublin",
  dublin: "Europe/Dublin",
  france: "Europe/Paris",
  paris: "Europe/Paris",
  lyon: "Europe/Paris",
  marseille: "Europe/Paris",
  germany: "Europe/Berlin",
  berlin: "Europe/Berlin",
  munich: "Europe/Berlin",
  hamburg: "Europe/Berlin",
  frankfurt: "Europe/Berlin",
  spain: "Europe/Madrid",
  madrid: "Europe/Madrid",
  barcelona: "Europe/Madrid",
  seville: "Europe/Madrid",
  portugal: "Europe/Lisbon",
  lisbon: "Europe/Lisbon",
  porto: "Europe/Lisbon",
  italy: "Europe/Rome",
  rome: "Europe/Rome",
  milan: "Europe/Rome",
  naples: "Europe/Rome",
  netherlands: "Europe/Amsterdam",
  holland: "Europe/Amsterdam",
  amsterdam: "Europe/Amsterdam",
  belgium: "Europe/Brussels",
  brussels: "Europe/Brussels",
  switzerland: "Europe/Zurich",
  zurich: "Europe/Zurich",
  geneva: "Europe/Zurich",
  austria: "Europe/Vienna",
  vienna: "Europe/Vienna",
  sweden: "Europe/Stockholm",
  stockholm: "Europe/Stockholm",
  norway: "Europe/Oslo",
  oslo: "Europe/Oslo",
  denmark: "Europe/Copenhagen",
  copenhagen: "Europe/Copenhagen",
  finland: "Europe/Helsinki",
  helsinki: "Europe/Helsinki",
  poland: "Europe/Warsaw",
  warsaw: "Europe/Warsaw",
  "czech republic": "Europe/Prague",
  czechia: "Europe/Prague",
  prague: "Europe/Prague",
  hungary: "Europe/Budapest",
  budapest: "Europe/Budapest",
  romania: "Europe/Bucharest",
  bucharest: "Europe/Bucharest",
  bulgaria: "Europe/Sofia",
  sofia: "Europe/Sofia",
  greece: "Europe/Athens",
  athens: "Europe/Athens",
  turkey: "Europe/Istanbul",
  istanbul: "Europe/Istanbul",
  ankara: "Europe/Istanbul",
  ukraine: "Europe/Kyiv",
  kyiv: "Europe/Kyiv",
  kiev: "Europe/Kyiv",
  russia: "Europe/Moscow",
  moscow: "Europe/Moscow",
  "st petersburg": "Europe/Moscow",
  croatia: "Europe/Zagreb",
  zagreb: "Europe/Zagreb",
  serbia: "Europe/Belgrade",
  belgrade: "Europe/Belgrade",
  slovakia: "Europe/Bratislava",
  bratislava: "Europe/Bratislava",
  luxembourg: "Europe/Luxembourg",
  iceland: "Atlantic/Reykjavik",
  reykjavik: "Atlantic/Reykjavik",

  // ── Africa ────────────────────────────────────────────────────────────────
  egypt: "Africa/Cairo",
  cairo: "Africa/Cairo",
  "south africa": "Africa/Johannesburg",
  johannesburg: "Africa/Johannesburg",
  capetown: "Africa/Johannesburg",
  "cape town": "Africa/Johannesburg",
  nigeria: "Africa/Lagos",
  lagos: "Africa/Lagos",
  abuja: "Africa/Lagos",
  kenya: "Africa/Nairobi",
  nairobi: "Africa/Nairobi",
  ethiopia: "Africa/Addis_Ababa",
  "addis ababa": "Africa/Addis_Ababa",
  ghana: "Africa/Accra",
  accra: "Africa/Accra",
  morocco: "Africa/Casablanca",
  casablanca: "Africa/Casablanca",
  tanzania: "Africa/Dar_es_Salaam",
  "dar es salaam": "Africa/Dar_es_Salaam",
  uganda: "Africa/Kampala",
  kampala: "Africa/Kampala",
  angola: "Africa/Luanda",
  luanda: "Africa/Luanda",

  // ── North America ─────────────────────────────────────────────────────────
  us: "America/New_York",
  usa: "America/New_York",
  "united states": "America/New_York",
  america: "America/New_York",
  newyork: "America/New_York",
  "new york": "America/New_York",
  nyc: "America/New_York",
  boston: "America/New_York",
  miami: "America/New_York",
  philadelphia: "America/New_York",
  washington: "America/New_York",
  atlanta: "America/New_York",
  detroit: "America/Detroit",
  chicago: "America/Chicago",
  austin: "America/Chicago",
  dallas: "America/Chicago",
  houston: "America/Chicago",
  minneapolis: "America/Chicago",
  denver: "America/Denver",
  "salt lake city": "America/Denver",
  phoenix: "America/Phoenix",
  seattle: "America/Los_Angeles",
  losangeles: "America/Los_Angeles",
  "los angeles": "America/Los_Angeles",
  la: "America/Los_Angeles",
  sanfrancisco: "America/Los_Angeles",
  "san francisco": "America/Los_Angeles",
  sf: "America/Los_Angeles",
  sanjose: "America/Los_Angeles",
  "san jose": "America/Los_Angeles",
  "silicon valley": "America/Los_Angeles",
  portland: "America/Los_Angeles",
  lasvegas: "America/Los_Angeles",
  "las vegas": "America/Los_Angeles",
  sandiego: "America/Los_Angeles",
  "san diego": "America/Los_Angeles",
  honolulu: "Pacific/Honolulu",
  hawaii: "Pacific/Honolulu",
  alaska: "America/Anchorage",
  anchorage: "America/Anchorage",
  canada: "America/Toronto",
  toronto: "America/Toronto",
  ottawa: "America/Toronto",
  montreal: "America/Toronto",
  vancouver: "America/Vancouver",
  calgary: "America/Edmonton",
  edmonton: "America/Edmonton",
  winnipeg: "America/Winnipeg",
  mexico: "America/Mexico_City",
  mexicocity: "America/Mexico_City",
  "mexico city": "America/Mexico_City",
  guadalajara: "America/Mexico_City",

  // ── Caribbean ─────────────────────────────────────────────────────────────
  cuba: "America/Havana",
  havana: "America/Havana",
  "puerto rico": "America/Puerto_Rico",
  "dominican republic": "America/Santo_Domingo",
  jamaica: "America/Jamaica",
  kingston: "America/Jamaica",

  // ── South America ─────────────────────────────────────────────────────────
  brazil: "America/Sao_Paulo",
  saopaulo: "America/Sao_Paulo",
  "sao paulo": "America/Sao_Paulo",
  "rio de janeiro": "America/Sao_Paulo",
  rio: "America/Sao_Paulo",
  argentina: "America/Argentina/Buenos_Aires",
  "buenos aires": "America/Argentina/Buenos_Aires",
  buenosaires: "America/Argentina/Buenos_Aires",
  chile: "America/Santiago",
  santiago: "America/Santiago",
  colombia: "America/Bogota",
  bogota: "America/Bogota",
  peru: "America/Lima",
  lima: "America/Lima",
  venezuela: "America/Caracas",
  caracas: "America/Caracas",
  ecuador: "America/Guayaquil",
  quito: "America/Guayaquil",
  bolivia: "America/La_Paz",
  "la paz": "America/La_Paz",
  uruguay: "America/Montevideo",
  montevideo: "America/Montevideo",
  paraguay: "America/Asuncion",
  asuncion: "America/Asuncion",
  panama: "America/Panama",
  "costa rica": "America/Costa_Rica",
  "san jose cr": "America/Costa_Rica",
};

// ─── Init ─────────────────────────────────────────────────────────────────────
populateTimezones();
localZone.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
DEFAULTS.forEach((tz) => {
  const supported = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : DEFAULTS;
  if (supported.includes(tz)) addZone(tz);
});
initTranslator();
startClock();

// ─── Event listeners ──────────────────────────────────────────────────────────
addBtn.addEventListener("click", commitAddZone);
addTzInput.addEventListener("keydown", (e) => { if (e.key === "Enter") commitAddZone(); });
addTzInput.addEventListener("input", () => syncTimezoneInput(addTzInput, addTzValue, false));
addTzInput.addEventListener("change", () => syncTimezoneInput(addTzInput, addTzValue, true));

translateTimeEl.addEventListener("input", renderTranslation);
translateDateEl.addEventListener("change", renderTranslation);
translateTzInput.addEventListener("input", () => { syncTimezoneInput(translateTzInput, translateTzValue, false); renderTranslation(); });
translateTzInput.addEventListener("change", () => { syncTimezoneInput(translateTzInput, translateTzValue, true); renderTranslation(); });

function commitAddZone() {
  const tz = addTzValue.value;
  if (!tz) {
    setAddZoneFeedback("Choose a valid city or timezone before adding it.", "error");
    addTzInput.classList.add("is-invalid");
    return;
  }
  if (zones.some((z) => z.timezone === tz)) {
    setAddZoneFeedback(`${simplifyZoneLabel(tz)} is already on the board.`, "error");
    addTzInput.classList.add("is-invalid");
    return;
  }
  addZone(tz);
  addTzInput.value = "";
  addTzValue.value = "";
  addTzInput.classList.remove("is-invalid");
  setAddZoneFeedback(`${simplifyZoneLabel(tz)} added.`, "success");
}

// ─── Zone management ──────────────────────────────────────────────────────────
function addZone(timezone) {
  zones.push({ id: nextId++, timezone, start: "09:00", end: "17:00", isHighlighted: true });
  render();
  notifyZoneChange();
}

function removeZone(id) {
  zones = zones.filter((z) => z.id !== id);
  render();
  notifyZoneChange();
}

function removeZoneByTimezone(timezone) {
  const zone = zones.find((z) => z.timezone === timezone);
  if (zone) removeZone(zone.id);
}

function getZonesSnapshot() {
  return zones.map(({ id, timezone, start, end, isHighlighted }) => ({
    id,
    timezone,
    start,
    end,
    isHighlighted,
  }));
}

function notifyZoneChange() {
  window.dispatchEvent(new CustomEvent("timezone-zones-changed", {
    detail: getZonesSnapshot(),
  }));
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  renderChips();
  renderTimeline();
  renderSummary();
  renderTranslation();
}

function renderChips() {
  zoneChipsEl.innerHTML = "";
  const now = new Date();

  // ── Local time chip (non-removable) ──────────────────────────────────────
  const localChip = document.createElement("div");
  localChip.className = `zone-chip zone-chip-local${localZone.isHighlighted ? "" : " is-dim"}`;
  const localTimeStr = formatZonedTime(now, localZone.timezone);
  const localIcon    = timeOfDayIcon(now, localZone.timezone);
  localChip.innerHTML = `
    <button class="chip-toggle ${localZone.isHighlighted ? "is-on" : "is-off"}" title="Toggle highlight">■</button>
    <span class="chip-icon">${localIcon}</span>
    <span class="chip-time">${localTimeStr}</span>
    <span class="chip-city">Local time</span>
    <span class="chip-range">
      <input class="chip-range-input" type="time" value="${localZone.start}" aria-label="Local start time" />
      <span class="chip-range-sep">–</span>
      <input class="chip-range-input" type="time" value="${localZone.end}" aria-label="Local end time" />
    </span>
  `;
  localChip.querySelector(".chip-toggle").addEventListener("click", () => {
    localZone.isHighlighted = !localZone.isHighlighted;
    localChip.querySelector(".chip-toggle").className = `chip-toggle ${localZone.isHighlighted ? "is-on" : "is-off"}`;
    localChip.classList.toggle("is-dim", !localZone.isHighlighted);
    renderTimeline(); renderSummary();
    notifyZoneChange();
  });
  const [ls, le] = localChip.querySelectorAll(".chip-range-input");
  ls.addEventListener("change", () => { localZone.start = ls.value; renderTimeline(); renderSummary(); notifyZoneChange(); });
  le.addEventListener("change", () => { localZone.end   = le.value; renderTimeline(); renderSummary(); notifyZoneChange(); });
  zoneChipsEl.appendChild(localChip);

  // ── Per-zone chips ────────────────────────────────────────────────────────
  zones.forEach(({ id, timezone, start, end, isHighlighted }) => {
    const chip = document.createElement("div");
    chip.className = "zone-chip";
    chip.dataset.id = id;

    const timeStr = formatZonedTime(now, timezone);
    const city = simplifyZoneLabel(timezone);
    const icon = timeOfDayIcon(now, timezone);

    chip.innerHTML = `
      <button class="chip-toggle ${isHighlighted ? "is-on" : "is-off"}" aria-label="Toggle highlight for ${city}" title="Toggle highlight">■</button>
      <span class="chip-icon">${icon}</span>
      <span class="chip-time">${timeStr}</span>
      <span class="chip-city">${city}</span>
      <span class="chip-range">
        <input class="chip-range-input" type="time" value="${start}" aria-label="Start time for ${city}" />
        <span class="chip-range-sep">–</span>
        <input class="chip-range-input" type="time" value="${end}" aria-label="End time for ${city}" />
      </span>
      <button class="chip-remove" aria-label="Remove ${city}">×</button>
    `;

    const zone = zones.find((z) => z.id === id);

    chip.querySelector(".chip-toggle").addEventListener("click", () => {
      zone.isHighlighted = !zone.isHighlighted;
      chip.querySelector(".chip-toggle").className = `chip-toggle ${zone.isHighlighted ? "is-on" : "is-off"}`;
      chip.classList.toggle("is-dim", !zone.isHighlighted);
      renderTimeline();
      renderSummary();
      notifyZoneChange();
    });

    const [startInput, endInput] = chip.querySelectorAll(".chip-range-input");
    startInput.addEventListener("change", () => {
      if (zone) { zone.start = startInput.value; renderTimeline(); renderSummary(); notifyZoneChange(); }
    });
    endInput.addEventListener("change", () => {
      if (zone) { zone.end = endInput.value; renderTimeline(); renderSummary(); notifyZoneChange(); }
    });

    chip.querySelector(".chip-remove").addEventListener("click", () => removeZone(id));
    zoneChipsEl.appendChild(chip);
  });
}

function renderTimeline() {
  timelineEl.innerHTML = "";

  const localMidnight = getLocalMidnight();
  const overlapCols = getOverlapCols(localMidnight);

  // Header row (hour numbers 00–23)
  timelineEl.appendChild(buildTimelineRow(null, null, null, localMidnight, overlapCols, true));

  // Local device time row — own available hours + overlap
  const localAvailCols = getZoneAvailCols(localZone, localMidnight);
  timelineEl.appendChild(buildTimelineRow("Local time", localZone.timezone, localAvailCols, localMidnight, overlapCols));

  // One row per selected zone, with its own available-hours columns
  zones.forEach((zone) => {
    const label = simplifyZoneLabel(zone.timezone);
    const availCols = getZoneAvailCols(zone, localMidnight);
    timelineEl.appendChild(buildTimelineRow(label, zone.timezone, availCols, localMidnight, overlapCols));
  });
}

function buildTimelineRow(label, timezone, availCols, localMidnight, overlapCols, isHeader = false) {
  const row = document.createElement("div");
  row.className = "tl-row";

  const labelEl = document.createElement("div");
  labelEl.className = "tl-label";
  labelEl.textContent = label ?? "";
  row.appendChild(labelEl);

  for (let h = 0; h < 24; h++) {
    const cell = document.createElement("div");
    cell.className = "tl-cell";

    if (isHeader) {
      cell.classList.add("tl-header-cell");
      cell.textContent = pad(h);
    } else {
      const colUtc = localMidnight + h * HOUR_MS;
      cell.textContent = pad(getHourInZone(colUtc, timezone));
      if (availCols && availCols.has(h)) cell.classList.add("is-zone-window");
      if (overlapCols.has(h)) cell.classList.add("is-overlap");
    }

    row.appendChild(cell);
  }

  return row;
}

function renderSummary() {
  const participants = [
    ...(localZone.isHighlighted ? [{ ...localZone, label: "Local" }] : []),
    ...zones.filter((z) => z.isHighlighted).map((z) => ({ ...z, label: simplifyZoneLabel(z.timezone) })),
  ];
  if (participants.length < 2) {
    summaryEl.innerHTML = "Enable highlights on at least two time zones (including Local) to see the overlap.";
    return;
  }

  const localMidnight = getLocalMidnight();
  const overlapCols = getOverlapCols(localMidnight);

  if (overlapCols.size === 0) {
    summaryEl.innerHTML = "No overlap found across the selected time periods.";
    return;
  }

  const overlapSegments = getHourSegments(overlapCols);
  const localRanges = formatSegmentsForZone(overlapSegments, localMidnight, localZone.timezone);
  const zoneLabels = participants.map(({ timezone, label }) =>
    `${formatSegmentsForZone(overlapSegments, localMidnight, timezone)} in ${label}`,
  ).join(", ");

  summaryEl.innerHTML =
    `Best overlapping ${overlapSegments.length === 1 ? "window" : "windows"}: ` +
    `<strong>${overlapCols.size}h total</strong> ` +
    `(local <strong>${localRanges}</strong>). ` +
    `That is ${zoneLabels}.`;
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function startClock() {
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const now = new Date();
  liveClockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if (liveDateEl) {
    liveDateEl.textContent = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  // Update chip times + icons every second (cheap DOM writes)
  const localChip = document.querySelector(".zone-chip-local");
  if (localChip) {
    localChip.querySelector(".chip-time").textContent = formatZonedTime(now, localZone.timezone);
    localChip.querySelector(".chip-icon").textContent = timeOfDayIcon(now, localZone.timezone);
  }
  document.querySelectorAll(".zone-chip:not(.zone-chip-local)").forEach((chip) => {
    const id = Number(chip.dataset.id);
    const zone = zones.find((z) => z.id === id);
    if (!zone) return;
    chip.querySelector(".chip-time").textContent = formatZonedTime(now, zone.timezone);
    chip.querySelector(".chip-icon").textContent = timeOfDayIcon(now, zone.timezone);
  });

  // Re-render timeline only when the hour changes
  const h = now.getHours();
  if (h !== lastRenderedHour) {
    lastRenderedHour = h;
    renderTimeline();
    renderSummary();
  }
}

// ─── Overlap calculation ──────────────────────────────────────────────────────
function getZoneAvailCols(zone, localMidnight) {
  if (!zone.isHighlighted) return new Set();
  const startMin = parseTimeToMinutes(zone.start);
  const endMin = parseTimeToMinutes(zone.end);
  const cols = new Set();
  for (let h = 0; h < 24; h++) {
    const colUtc = localMidnight + h * HOUR_MS;
    if (isInWorkWindow(getHourInZone(colUtc, zone.timezone), startMin, endMin)) cols.add(h);
  }
  return cols;
}

function getOverlapCols(localMidnight) {
  const participants = [
    ...(localZone.isHighlighted ? [localZone] : []),
    ...zones.filter((z) => z.isHighlighted),
  ];
  if (participants.length < 2) return new Set();

  const cols = new Set();
  for (let h = 0; h < 24; h++) {
    const colUtc = localMidnight + h * HOUR_MS;
    if (participants.every(({ timezone, start, end }) => {
      const startMin = parseTimeToMinutes(start);
      const endMin = parseTimeToMinutes(end);
      return isInWorkWindow(getHourInZone(colUtc, timezone), startMin, endMin);
    })) {
      cols.add(h);
    }
  }
  return cols;
}

function parseTimeToMinutes(timeValue) {
  const [hours, minutes = 0] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
}

function isInWorkWindow(hour, startMin, endMin) {
  if (startMin === endMin) return false;
  const hourMin = hour * 60;
  if (startMin < endMin) return hourMin >= startMin && hourMin < endMin;
  return hourMin >= startMin || hourMin < endMin; // overnight window (e.g. 20:00–08:00)
}

function getHourSegments(hoursSet) {
  const hours = [...hoursSet].sort((a, b) => a - b);
  if (hours.length === 0) return [];

  const segments = [];
  let start = hours[0];
  let previous = hours[0];

  for (const hour of hours.slice(1)) {
    if (hour === previous + 1) {
      previous = hour;
      continue;
    }

    segments.push({ start, end: previous + 1 });
    start = hour;
    previous = hour;
  }

  segments.push({ start, end: previous + 1 });

  if (segments.length > 1 && segments[0].start === 0 && segments[segments.length - 1].end === 24) {
    const first = segments.shift();
    const last = segments.pop();
    segments.unshift({ start: last.start, end: first.end });
  }

  return segments;
}

function formatSegmentsForZone(segments, localMidnight, timezone) {
  return segments.map(({ start, end }) => {
    const startHour = getHourInZone(localMidnight + start * HOUR_MS, timezone);
    const endHour = getHourInZone(localMidnight + end * HOUR_MS, timezone);
    return `${pad(startHour)}:00–${pad(endHour)}:00`;
  }).join(", ");
}

// ─── Time translator ──────────────────────────────────────────────────────────
function initTranslator() {
  // Default source timezone = local device timezone
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  setTimezoneField(translateTzInput, translateTzValue, localTz);

  // Default date = today
  const now = new Date();
  translateDateEl.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // Default time = current local time (rounded to minute)
  translateTimeEl.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  renderTranslation();
}

function renderTranslation() {
  translateResults.innerHTML = "";

  const timeStr  = translateTimeEl.value;
  const dateStr  = translateDateEl.value;
  const sourceTz = translateTzValue.value;

  const targets = [
    { timezone: localZone.timezone, city: "Local time" },
    ...zones.map(({ timezone }) => ({ timezone, city: simplifyZoneLabel(timezone) })),
  ];

  if (!timeStr || !dateStr || !sourceTz || targets.length === 0) return;

  let sourceUtc;
  try {
    sourceUtc = localTimeToUtc(dateStr, timeStr, sourceTz);
  } catch {
    return;
  }

  const sourceParts   = getZonedParts(new Date(sourceUtc), sourceTz);

  targets.forEach(({ timezone, city }) => {
    const parts = getZonedParts(new Date(sourceUtc), timezone);
    const timeLabel = `${pad(parts.hour)}:${pad(parts.minute)}`;

    const dayDiff = Math.round(
      (Date.UTC(parts.year, parts.month - 1, parts.day) -
       Date.UTC(sourceParts.year, sourceParts.month - 1, sourceParts.day)) /
      (24 * 60 * 60 * 1000)
    );
    const dayBadge = dayDiff === 0 ? "" :
      dayDiff > 0 ? `<span class="tr-day-badge tr-next">+${dayDiff}d</span>` :
                    `<span class="tr-day-badge tr-prev">${dayDiff}d</span>`;

    const row = document.createElement("div");
    row.className = "tr-row";
    row.innerHTML = `
      <span class="tr-city">${city}</span>
      <span class="tr-time">${timeLabel}${dayBadge}</span>
      <span class="tr-date">${formatShortDate(parts)}</span>
      <span class="tr-tz">${timezone}</span>
    `;
    translateResults.appendChild(row);
  });
}

function localTimeToUtc(dateStr, timeStr, timezone) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes]   = timeStr.split(":").map(Number);

  let utcMs = Date.UTC(year, month - 1, day, hours, minutes);

  for (let i = 0; i < 4; i++) {
    const parts = getZonedParts(new Date(utcMs), timezone);
    const diff =
      Date.UTC(year, month - 1, day, hours, minutes) -
      Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    if (Math.abs(diff) < 60000) break;
    utcMs += diff;
  }

  return utcMs;
}

function formatShortDate(parts) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parts.month - 1]} ${parts.day}`;
}

// ─── Timezone index / populate ────────────────────────────────────────────────
function populateTimezones() {
  const supported = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "Asia/Shanghai", "America/Los_Angeles", "America/New_York",
        "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Australia/Sydney",
      ];

  supported.forEach((timeZone) => {
    const displayLabel = buildTimezoneLabel(timeZone);
    let extraSearch = "";

    if (timeZone === "UTC") {
      extraSearch = " gmt+0 utc+0 +0000 +00:00";
    } else {
      const etcMatch = timeZone.match(/^Etc\/GMT([+-]\d+)$/);
      if (etcMatch) {
        const ianaOffset = parseInt(etcMatch[1], 10);
        const utcHours = -ianaOffset;
        const utcSign = utcHours >= 0 ? "+" : "-";
        const abs = Math.abs(utcHours);
        const paddedCode = `${utcSign}${String(abs * 100).padStart(4, "0")}`;
        extraSearch = ` gmt${utcSign}${abs} utc${utcSign}${abs} ${utcSign}${abs} ${paddedCode} ${utcSign}${pad(abs)}:00`;
      }
    }

    timezoneIndex.push({
      timeZone,
      label: displayLabel,
      normalized: normalizeLookupValue(`${timeZone} ${displayLabel}${extraSearch}`),
    });

    const option = document.createElement("option");
    option.value = displayLabel;
    tzOptions.appendChild(option);
  });
}

function buildTimezoneLabel(timeZone) {
  if (timeZone === "UTC") return "+0000  GMT+0";

  const etcMatch = timeZone.match(/^Etc\/GMT([+-]\d+)$/);
  if (etcMatch) {
    const ianaOffset = parseInt(etcMatch[1], 10);
    const utcHours = -ianaOffset;
    const utcSign = utcHours >= 0 ? "+" : "-";
    const posixSign = ianaOffset >= 0 ? "+" : "-";
    const posixCode = `${posixSign}${String(Math.abs(ianaOffset) * 100).padStart(4, "0")}`;
    return `${posixCode}  GMT${utcSign}${Math.abs(utcHours)}`;
  }

  const segments = timeZone.split("/");
  const city = segments[segments.length - 1].replace(/_/g, " ");
  const region = segments.slice(0, -1).join(" / ").replace(/_/g, " ");
  return region ? `${city} (${region}) - ${timeZone}` : `${city} - ${timeZone}`;
}

function setTimezoneField(visibleInput, hiddenInput, timeZone) {
  const match = timezoneIndex.find((entry) => entry.timeZone === timeZone);
  if (!match) {
    visibleInput.value = timeZone;
    hiddenInput.value = timeZone;
    return;
  }
  visibleInput.value = match.label;
  hiddenInput.value = match.timeZone;
}

function syncTimezoneInput(visibleInput, hiddenInput, shouldCommitLabel) {
  const rawValue = visibleInput.value.trim();
  const normalized = normalizeLookupValue(rawValue);

  if (!normalized) {
    hiddenInput.value = "";
    if (visibleInput === addTzInput) {
      addTzInput.classList.remove("is-invalid");
      setAddZoneFeedback("", "neutral");
    }
    return;
  }

  const offsetTz = parseGmtOffset(normalized);
  if (offsetTz) {
    const offsetMatch = timezoneIndex.find((entry) => entry.timeZone === offsetTz);
    if (offsetMatch) {
      if (shouldCommitLabel) visibleInput.value = offsetMatch.label;
      hiddenInput.value = offsetMatch.timeZone;
      handleResolvedTimezoneInput(visibleInput, offsetMatch.timeZone);
      return;
    }
  }

  const aliasTimeZone = cityAliasMap[normalized];
  if (aliasTimeZone) {
    const aliasMatch = timezoneIndex.find((entry) => entry.timeZone === aliasTimeZone);
    if (aliasMatch) {
      if (shouldCommitLabel) visibleInput.value = aliasMatch.label;
      hiddenInput.value = aliasMatch.timeZone;
      handleResolvedTimezoneInput(visibleInput, aliasMatch.timeZone);
      return;
    }
  }

  const exactMatch = timezoneIndex.find((entry) =>
    normalizeLookupValue(entry.label) === normalized ||
    normalizeLookupValue(entry.timeZone) === normalized,
  );
  if (exactMatch) {
    if (shouldCommitLabel) visibleInput.value = exactMatch.label;
    hiddenInput.value = exactMatch.timeZone;
    handleResolvedTimezoneInput(visibleInput, exactMatch.timeZone);
    return;
  }

  const prefixMatches = timezoneIndex.filter((entry) => entry.normalized.includes(normalized));
  if (shouldCommitLabel && prefixMatches.length === 1) {
    visibleInput.value = prefixMatches[0].label;
    hiddenInput.value = prefixMatches[0].timeZone;
    handleResolvedTimezoneInput(visibleInput, prefixMatches[0].timeZone);
    return;
  }

  hiddenInput.value = "";
  if (visibleInput === addTzInput) {
    addTzInput.classList.add("is-invalid");
    setAddZoneFeedback("Not matched yet. Try a city, country, or GMT offset.", "error");
  }
}

function handleResolvedTimezoneInput(visibleInput, timezone) {
  if (visibleInput !== addTzInput) return;
  addTzInput.classList.remove("is-invalid");
  setAddZoneFeedback(`Ready to add ${simplifyZoneLabel(timezone)}.`, "success");
}

function setAddZoneFeedback(message, type) {
  if (!addZoneFeedbackEl) return;
  addZoneFeedbackEl.textContent = message;
  addZoneFeedbackEl.className = `input-feedback${type === "error" ? " is-error" : type === "success" ? " is-success" : ""}`;
}

function normalizeLookupValue(value) {
  return value.toLowerCase().replace(/[_/-]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseGmtOffset(normalized) {
  if (normalized === "gmt" || normalized === "utc") return "UTC";

  const match = normalized.match(/^(?:gmt|utc)?\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || "0", 10);

  if (hours > 14 || minutes >= 60) return null;

  const totalMinutes = sign * (hours * 60 + minutes);

  if (minutes === 0) {
    if (totalMinutes === 0) return "UTC";
    const etcSign = totalMinutes > 0 ? "-" : "+";
    return `Etc/GMT${etcSign}${Math.abs(hours)}`;
  }

  const fractionalMap = {
    "-210": "America/St_Johns",
     "210": "Asia/Tehran",
     "270": "Asia/Kabul",
     "330": "Asia/Kolkata",
     "345": "Asia/Kathmandu",
     "390": "Asia/Yangon",
     "570": "Australia/Darwin",
     "630": "Australia/Lord_Howe",
  };

  return fractionalMap[String(totalMinutes)] || null;
}

// ─── Intl helpers ─────────────────────────────────────────────────────────────
function getZonedParts(date, timeZone) {
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

function getHourInZone(utcMs, timezone) {
  return getZonedParts(new Date(utcMs), timezone).hour;
}

function formatZonedTime(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function timeOfDayIcon(date, timezone) {
  const h = getHourInZone(date.getTime(), timezone);
  if (h >= 5 && h < 8)  return "🌅";
  if (h >= 8 && h < 18) return "☀️";
  if (h >= 18 && h < 21) return "🌆";
  return "🌙";
}

function simplifyZoneLabel(timeZone) {
  const segs = timeZone.split("/");
  return segs[segs.length - 1].replace(/_/g, " ");
}

function getLocalMidnight() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
}

function pad(n) {
  return String(n).padStart(2, "0");
}
