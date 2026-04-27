import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import "../world-data.js";
import "../script.js";
import Globe from "../globe.jsx";

if (!window.__tzBridge) {
  window.__tzBridge = {
    zones: typeof window.getTimezoneZones === "function" ? window.getTimezoneZones() : [],
    version: 0,
    subs: new Set(),
    bump() {
      this.version++;
      this.subs.forEach((fn) => { try { fn(); } catch {} });
    },
    subscribe(fn) {
      this.subs.add(fn);
      return () => this.subs.delete(fn);
    },
  };
  window.addEventListener("timezone-zones-changed", (event) => {
    window.__tzBridge.zones = event.detail || [];
    window.__tzBridge.bump();
  });
}

const TWEAK_DEFAULTS = {
  style: "wireframe",
  rotationMode: "spin",
  infoDensity: "detailed",
};

function addZoneFromPin(tz) {
  const bridge = window.__tzBridge;
  if (!bridge) return;
  if (bridge.zones.some((z) => z.timezone === tz)) return;
  if (typeof window.addZone === "function") window.addZone(tz);
}

function removeZoneByTz(tz) {
  if (typeof window.removeZoneByTimezone === "function") window.removeZoneByTimezone(tz);
}

function simplify(tz) {
  return tz.split("/").pop().replace(/_/g, " ");
}

function timeOfDayIcon(date, tz) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(date));
  if (h >= 5 && h < 8) return "◔";
  if (h >= 8 && h < 18) return "◉";
  if (h >= 18 && h < 21) return "◑";
  return "◌";
}

function tzOffsetMinutes(date, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

function PinCard({ pin, now, isLocal, infoDensity, localTz, onRemove }) {
  const tz = pin.tz;
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const sec = new Intl.DateTimeFormat("en-GB", { timeZone: tz, second: "2-digit", hour12: false }).format(now);
  const dateStr = new Intl.DateTimeFormat(undefined, { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(now);
  const icon = timeOfDayIcon(now, tz);

  let deltaStr = "";
  if (!isLocal && localTz) {
    const off = tzOffsetMinutes(now, tz) - tzOffsetMinutes(now, localTz);
    const hours = off / 60;
    if (hours === 0) deltaStr = "same as you";
    else {
      const sign = hours > 0 ? "+" : "";
      const h = Number.isInteger(hours) ? hours : hours.toFixed(1);
      deltaStr = `${sign}${h}h from you`;
    }
  }

  return (
    <div className={`pin-card${isLocal ? " is-local" : ""}${pin.isHighlighted === false ? " is-dim" : ""}`}>
      {!isLocal && (
        <button className="pc-remove" onClick={() => onRemove(pin.tz)} title={`Remove ${pin.label}`} aria-label={`Remove ${pin.label}`}>×</button>
      )}
      <div className="pc-top">
        <span>{isLocal ? "LOCAL" : "PINNED"}</span>
        <span className="pc-icon">{icon}</span>
      </div>
      <div className="pc-time">
        {timeStr}
        {infoDensity !== "minimal" && <span className="pc-seconds">:{sec}</span>}
      </div>
      <div className="pc-city">{pin.label}</div>
      {infoDensity === "detailed" && (
        <>
          <div className="pc-meta">{dateStr}</div>
          <div className="pc-meta pc-timezone">{tz}</div>
        </>
      )}
      {infoDensity === "delta" && deltaStr && (
        <div className={`pc-delta${deltaStr === "same as you" ? " pc-delta-zero" : ""}`}>{deltaStr}</div>
      )}
      {infoDensity === "minimal" && (
        <div className="pc-meta">{dateStr.split(",")[0]}</div>
      )}
    </div>
  );
}

function GlobeSearch({ pins, onSelect }) {
  const mount = document.getElementById("globe-search-mount");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = React.useRef(null);

  const pinnedTzSet = useMemo(() => new Set(pins.map((p) => p.tz)), [pins]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const c of window.WORLD_CITIES) {
      const name = c.name.toLowerCase();
      const tz = c.tz.toLowerCase();
      let score = 0;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 60;
      else if (tz.includes(q)) score = 40;
      if (score > 0) scored.push({ city: c, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8).map((s) => s.city);
  }, [query]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const pick = (city) => {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    onSelect(city);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[activeIdx]) {
      e.preventDefault();
      pick(results[activeIdx]);
    }
  };

  if (!mount) return null;

  return createRootPortal(
    <div className="globe-search">
      <svg className="globe-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11 L14 14" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        className="globe-search-input"
        placeholder="Search a city to pin..."
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && query.trim() ? "true" : "false"}
        aria-controls="globe-search-results"
        aria-activedescendant={open && results[activeIdx] ? `globe-search-result-${activeIdx}` : undefined}
        aria-label="Search a city to pin"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && query.trim() && (
        <div className="globe-search-results" id="globe-search-results" role="listbox">
          {results.length === 0 ? (
            <div className="globe-search-empty">No cities match "{query}"</div>
          ) : results.map((city, i) => {
            const isPinned = pinnedTzSet.has(city.tz);
            return (
              <div
                key={city.name + city.tz}
                id={`globe-search-result-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                className={"globe-search-result" + (i === activeIdx ? " is-active" : "")}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => { e.preventDefault(); pick(city); }}
              >
                <span className="globe-search-result-name">
                  {city.name}
                  {isPinned && <span className="globe-search-pinned">pinned</span>}
                </span>
                <span className="globe-search-result-tz">{simplify(city.tz)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>,
    mount,
  );
}

function createRootPortal(content, mount) {
  return createPortal(content, mount);
}

function App() {
  const [tweaks, setTweaks] = useState(() => {
    try { return { ...TWEAK_DEFAULTS, ...(JSON.parse(localStorage.getItem("tz-tweaks") || "{}")) }; }
    catch { return { ...TWEAK_DEFAULTS }; }
  });
  const [focusTarget, setFocusTarget] = useState(null);
  const [localHidden, setLocalHidden] = useState(false);
  const [, forceTick] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const localTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const bridge = window.__tzBridge;
    if (!bridge) return undefined;
    return bridge.subscribe(() => forceTick((n) => n + 1));
  }, []);

  useEffect(() => {
    try { localStorage.setItem("tz-tweaks", JSON.stringify(tweaks)); } catch {}
  }, [tweaks]);

  const cityByTz = useMemo(() => {
    const map = {};
    for (const c of window.WORLD_CITIES) {
      if (!map[c.tz]) map[c.tz] = c;
    }
    return map;
  }, []);

  const pins = useMemo(() => {
    const zs = (window.__tzBridge && window.__tzBridge.zones) || [];
    return zs.map((z) => {
      const city = cityByTz[z.timezone];
      return {
        id: z.id,
        tz: z.timezone,
        label: city ? city.name : simplify(z.timezone),
        lat: city ? city.lat : 0,
        lon: city ? city.lon : 0,
        isHighlighted: z.isHighlighted,
      };
    });
  }, [cityByTz, (window.__tzBridge && window.__tzBridge.version) || 0]);

  const localCity = cityByTz[localTz];
  const localPin = localCity ? {
    id: "local",
    tz: localTz,
    label: localCity.name + " (you)",
    lat: localCity.lat,
    lon: localCity.lon,
    isHighlighted: true,
  } : null;

  const globePins = (localPin && !localHidden) ? [localPin, ...pins] : pins;

  const onSearchSelect = (city) => {
    setFocusTarget({ lat: city.lat, lon: city.lon, key: Date.now() });
    setTimeout(() => addZoneFromPin(city.tz), 850);
  };

  const onTweak = (key, val) => setTweaks((t) => ({ ...t, [key]: val }));

  return (
    <>
      <GlobeSearch pins={globePins} onSelect={onSearchSelect} />
      <Globe
        size={460}
        pins={globePins}
        onPin={(city) => addZoneFromPin(city.tz)}
        onUnpin={(pin) => pin.id === "local" ? setLocalHidden(true) : removeZoneByTz(pin.tz)}
        localTz={localTz}
        style={tweaks.style}
        rotationMode={tweaks.rotationMode}
        infoDensity={tweaks.infoDensity}
        focusTarget={focusTarget}
      />
      <PinPanel
        pins={pins}
        now={now}
        localTz={localTz}
        localCity={localCity}
        infoDensity={tweaks.infoDensity}
      />
      <TweaksPanel tweaks={tweaks} onChange={onTweak} />
    </>
  );
}

function PinPanel({ pins, now, localTz, localCity, infoDensity }) {
  const mount = document.getElementById("pin-panel");
  const localPin = localCity ? {
    tz: localTz,
    label: localCity.name,
    isHighlighted: true,
  } : { tz: localTz, label: "Local", isHighlighted: true };

  if (!mount) return null;

  return createRootPortal(
    <>
      <div className="pin-panel-header">
        <span className="pin-panel-title">Pinned Times</span>
        <span className="pin-panel-count">
          {pins.length + 1} {pins.length === 0 ? "zone" : "zones"}
        </span>
      </div>
      <PinCard pin={localPin} now={now} isLocal infoDensity={infoDensity} localTz={localTz} />
      {pins.length > 0 ? (
        <div className="pin-grid">
          {pins.map((p) => (
            <PinCard
              key={p.id}
              pin={p}
              now={now}
              isLocal={false}
              infoDensity={infoDensity}
              localTz={localTz}
              onRemove={removeZoneByTz}
            />
          ))}
        </div>
      ) : (
        <div className="pin-empty">
          Click anywhere on the globe to drop your <span className="pin-empty-accent">first pin</span>.
        </div>
      )}
    </>,
    mount,
  );
}

function TweaksPanel({ tweaks, onChange }) {
  useEffect(() => {
    document.querySelectorAll(".tweak-options").forEach((group) => {
      const key = group.dataset.tweak;
      group.querySelectorAll("button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.val === tweaks[key]);
        button.onclick = () => onChange(key, button.dataset.val);
      });
    });
  }, [tweaks, onChange]);
  return null;
}

createRoot(document.getElementById("globe-mount")).render(<App />);

window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "__activate_edit_mode") {
    document.getElementById("tweaks-panel").classList.add("is-open");
  } else if (data.type === "__deactivate_edit_mode") {
    document.getElementById("tweaks-panel").classList.remove("is-open");
  }
});

try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
