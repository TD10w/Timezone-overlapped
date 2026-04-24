import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CitySearchBox from "./components/CitySearchBox.jsx";
import Globe from "./components/Globe.jsx";
import OverlapBoard from "./components/OverlapBoard.jsx";
import PinPanel from "./components/PinPanel.jsx";
import Translator from "./components/Translator.jsx";
import { FIRST_CITY_BY_TZ, CITY_BY_ID } from "./data/world.js";
import { buildShareUrl, getLocalTimezone, loadInitialState, persistState } from "./lib/state.js";

export default function App() {
  const [state, setState] = useState(() => loadInitialState());
  const [now, setNow] = useState(() => new Date());
  const [shareStatus, setShareStatus] = useState("");
  const [focusTarget, setFocusTarget] = useState(null);
  const [globeSize, setGlobeSize] = useState(460);
  const globePanelRef = useRef(null);
  const globeStageRef = useRef(null);
  const pendingGlobeAnchorTopRef = useRef(null);
  const localTimezone = useMemo(() => getLocalTimezone(), []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    persistState(state);
    const url = buildShareUrl(state);
    window.history.replaceState(null, "", url);
  }, [state]);

  useEffect(() => {
    if (!globePanelRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setGlobeSize(Math.max(300, Math.min(460, Math.floor(width))));
    });
    observer.observe(globePanelRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const previousTop = pendingGlobeAnchorTopRef.current;
    if (previousTop === null || !globeStageRef.current) return;
    pendingGlobeAnchorTopRef.current = null;
    const nextTop = globeStageRef.current.getBoundingClientRect().top;
    const delta = nextTop - previousTop;
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
  }, [state.zones, state.globe.localHidden]);

  const updateState = (updater) => setState((current) => typeof updater === "function" ? updater(current) : updater);

  const keepGlobeAnchored = () => {
    if (globeStageRef.current) {
      pendingGlobeAnchorTopRef.current = globeStageRef.current.getBoundingClientRect().top;
    }
  };

  const addCity = (city, options = {}) => {
    const { focus = true, keepAnchor = false } = options;
    if (state.zones.some((zone) => zone.timezone === city.tz)) {
      pendingGlobeAnchorTopRef.current = null;
      return;
    }
    if (keepAnchor) keepGlobeAnchored();
    updateState((current) => {
      if (current.zones.some((zone) => zone.timezone === city.tz)) return current;
      return {
        ...current,
        zones: [
          ...current.zones,
          {
            id: `zone-${city.id}`,
            timezone: city.tz,
            label: city.name,
            start: "09:00",
            end: "17:00",
            highlighted: true,
            sourceCityId: city.id,
          },
        ],
      };
    });
    if (focus) setFocusTarget({ lat: city.lat, lon: city.lon, key: Date.now() });
  };

  const updateZone = (id, patch) => updateState((current) => ({
    ...current,
    zones: current.zones.map((zone) => zone.id === id ? { ...zone, ...patch } : zone),
  }));

  const removeZone = (id, options = {}) => {
    if (options.keepAnchor) keepGlobeAnchored();
    updateState((current) => ({
      ...current,
      zones: current.zones.filter((zone) => zone.id === "local" || zone.id !== id),
    }));
  };

  const updateGlobe = (patch) => updateState((current) => ({
    ...current,
    globe: { ...current.globe, ...patch },
  }));

  const globePins = useMemo(() => state.zones
    .filter((zone) => !(zone.id === "local" && state.globe.localHidden))
    .map((zone) => {
      const city = (zone.sourceCityId && CITY_BY_ID[zone.sourceCityId]) || FIRST_CITY_BY_TZ[zone.timezone];
      return {
        id: zone.id,
        tz: zone.timezone,
        label: zone.id === "local" && city ? `${city.name} (you)` : zone.label,
        lat: city ? city.lat : 0,
        lon: city ? city.lon : 0,
        highlighted: zone.highlighted,
      };
    }), [state.globe.localHidden, state.zones]);

  const share = async () => {
    const url = buildShareUrl(state);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("Share link copied.");
    } catch {
      setShareStatus("Share link is in the address bar.");
    }
    setTimeout(() => setShareStatus(""), 2200);
  };

  return (
    <main className="page-shell">
      <div className="app-headline">
        <div className="app-title-group">
          <h1 className="app-title">Timezone<span className="app-title-accent"> Overlap</span></h1>
          <p className="app-subtitle">Pick any spot on Earth, compare hourly overlap windows, and share the board.</p>
        </div>
        <div className="headline-clock-group">
          <time className="live-clock" aria-live="off">{now.toLocaleTimeString("en-GB", { hour12: false })}</time>
          <p className="live-date">{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
        </div>
      </div>

      <OverlapBoard
        state={state}
        now={now}
        shareStatus={shareStatus}
        onShare={share}
        onAddCity={addCity}
        onUpdateZone={updateZone}
        onRemoveZone={removeZone}
        onDateChange={(date) => updateState((current) => ({ ...current, date }))}
      />

      <div className="section-divider">Pick on the Globe</div>
      <div className="globe-stage" ref={globeStageRef}>
        <div className="globe-panel" ref={globePanelRef}>
          <CitySearchBox
            pinnedTimezones={state.zones.map((zone) => zone.timezone)}
            onSelect={addCity}
            placeholder="Search a city to pin on the globe..."
          />
          <Globe
            size={globeSize}
            pins={globePins}
            onPin={(city) => addCity(city, { focus: false, keepAnchor: true })}
            onUnpin={(pin) => {
              keepGlobeAnchored();
              if (pin.id === "local") updateGlobe({ localHidden: true });
              else removeZone(pin.id, { keepAnchor: true });
            }}
            style={state.globe.style}
            rotationMode={state.globe.rotationMode}
            focusTarget={focusTarget}
          />
          <div className="globe-caption"><kbd>drag</kbd> to rotate · <kbd>click</kbd> to drop a pin · auto-spins idle</div>
          <TweakControls globe={state.globe} onChange={updateGlobe} />
        </div>
        <PinPanel
          zones={state.zones}
          now={now}
          localTimezone={localTimezone}
          infoDensity={state.globe.infoDensity}
          onRemove={(id) => removeZone(id, { keepAnchor: true })}
        />
      </div>

      <Translator
        state={state}
        onChange={(translatorPatch) => updateState((current) => ({
          ...current,
          translator: { ...current.translator, ...translatorPatch },
        }))}
      />
    </main>
  );
}

function TweakControls({ globe, onChange }) {
  return (
    <div className="tweaks-inline">
      <Segmented label="Globe style" value={globe.style} options={[["wireframe", "Wire"], ["filled", "Filled"], ["dotted", "Dotted"]]} onChange={(style) => onChange({ style })} />
      <Segmented label="Rotation" value={globe.rotationMode} options={[["spin", "Auto-spin"], ["centered", "On me"], ["static", "Static"]]} onChange={(rotationMode) => onChange({ rotationMode })} />
      <Segmented label="Pin info" value={globe.infoDensity} options={[["minimal", "Minimal"], ["detailed", "Detailed"], ["delta", "Delta"]]} onChange={(infoDensity) => onChange({ infoDensity })} />
    </div>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div className="tweak-group">
      <div className="tweak-label">{label}</div>
      <div className="tweak-options">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            className={optionValue === value ? "is-active" : ""}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
