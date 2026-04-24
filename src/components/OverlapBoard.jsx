import CitySearchBox from "./CitySearchBox.jsx";
import {
  buildTimeline,
  formatSegmentsForZone,
  formatZonedTime,
  getSlotSegments,
  getTotalMinutesInZone,
  minutesToTime,
  pad,
  SLOT_MINUTES,
  SLOT_MS,
  SLOTS_PER_DAY,
  timeOfDayIcon,
} from "../lib/time.js";

const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

export default function OverlapBoard({ state, now, onAddCity, onUpdateZone, onRemoveZone, onDateChange, shareStatus, onShare }) {
  const timeline = buildTimeline(state.date, state.zones);
  const overlapSegments = getSlotSegments(timeline.overlapSlots);
  const highlighted = state.zones.filter((zone) => zone.highlighted);

  return (
    <>
      <header className="topbar">
        <div className="add-zone-bar">
          <CitySearchBox
            pinnedTimezones={state.zones.map((zone) => zone.timezone)}
            onSelect={onAddCity}
            placeholder="Search city, country, alias, or timezone..."
          />
          <label className="date-control">
            <span>Plan date</span>
            <input type="date" value={state.date} onChange={(event) => onDateChange(event.target.value)} />
          </label>
          <button id="add-btn" type="button" onClick={onShare}>Share</button>
        </div>
      </header>
      <p className={`input-feedback${shareStatus ? " is-success" : ""}`}>{shareStatus}</p>

      <div className="section-divider">Overlap Board</div>
      <div className="zone-chips">
        {state.zones.map((zone) => (
          <ZoneChip
            key={zone.id}
            zone={zone}
            now={now}
            canRemove={zone.id !== "local"}
            onUpdate={(patch) => onUpdateZone(zone.id, patch)}
            onRemove={() => onRemoveZone(zone.id)}
          />
        ))}
      </div>

      <div className="legend">
        <span className="legend-item"><span className="legend-swatch legend-swatch--work" />Work hours</span>
        <span className="legend-sep">·</span>
        <span className="legend-item"><span className="legend-swatch legend-swatch--overlap" />Overlap window</span>
      </div>

      <div className="timeline-wrap">
        <div className="timeline-matrix timeline-matrix-v1">
          <TimelineHeader startMs={timeline.startMs} />
          {state.zones.map((zone) => (
            <TimelineRow
              key={zone.id}
              zone={zone}
              startMs={timeline.startMs}
              zoneSlots={timeline.zoneSlots.get(zone.id) || new Set()}
              overlapSlots={timeline.overlapSlots}
            />
          ))}
        </div>
      </div>

      <p className="overlap-summary">
        {renderSummary(highlighted, overlapSegments, timeline.startMs, timeline.overlapSlots.size)}
      </p>
    </>
  );
}

function ZoneChip({ zone, now, canRemove, onUpdate, onRemove }) {
  return (
    <div className={`zone-chip${zone.id === "local" ? " zone-chip-local" : ""}${zone.highlighted ? "" : " is-dim"}`}>
      <button
        className={`chip-toggle ${zone.highlighted ? "is-on" : "is-off"}`}
        type="button"
        aria-label={`Toggle highlight for ${zone.label}`}
        title="Toggle highlight"
        onClick={() => onUpdate({ highlighted: !zone.highlighted })}
      >
        ■
      </button>
      <span className="chip-icon">{timeOfDayIcon(now, zone.timezone)}</span>
      <span className="chip-time">{formatZonedTime(now, zone.timezone)}</span>
      <span className="chip-city">{zone.label}</span>
      <span className="chip-range">
        <input className="chip-range-input" type="time" step="3600" value={zone.start} onChange={(event) => onUpdate({ start: event.target.value })} aria-label={`Start time for ${zone.label}`} />
        <span className="chip-range-sep">-</span>
        <input className="chip-range-input" type="time" step="3600" value={zone.end} onChange={(event) => onUpdate({ end: event.target.value })} aria-label={`End time for ${zone.label}`} />
      </span>
      {canRemove && <button className="chip-remove" type="button" aria-label={`Remove ${zone.label}`} onClick={onRemove}>x</button>}
    </div>
  );
}

function TimelineHeader() {
  const cells = [];
  for (let hour = 0; hour < 24; hour += 1) {
    cells.push(
      <div key={hour} className="tl-cell tl-hour-cell tl-header-cell">
        {pad(hour)}
      </div>,
    );
  }
  return <div className="tl-row tl-row-v1"><div className="tl-label" />{cells}</div>;
}

function TimelineRow({ zone, startMs, zoneSlots, overlapSlots }) {
  const cells = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const slot = hour * SLOTS_PER_HOUR;
    const utcMs = startMs + slot * SLOT_MS;
    const minute = getTotalMinutesInZone(utcMs, zone.timezone);
    const time = minutesToTime(minute);
    const isZoneWindow = zoneSlots.has(slot);
    const isOverlap = overlapSlots.has(slot);
    cells.push(
      <div
        key={hour}
        title={`${zone.label} ${time}-${minutesToTime(minute + 60)}`}
        className={[
          "tl-cell tl-hour-cell",
          isZoneWindow ? "is-zone-window" : "",
          isOverlap ? "is-overlap" : "",
        ].filter(Boolean).join(" ")}
      >
        <span className="tl-cell-label">{time.slice(0, 2)}</span>
      </div>,
    );
  }
  return <div className="tl-row tl-row-v1"><div className="tl-label">{zone.label}</div>{cells}</div>;
}

function renderSummary(highlighted, segments, startMs, overlapSlotCount) {
  if (highlighted.length < 2) {
    return "Enable highlights on at least two time zones to see the overlap.";
  }
  if (!segments.length) {
    return "No overlap found across the selected time periods.";
  }
  const localZone = highlighted[0];
  const localRanges = formatSegmentsForZone(segments, startMs, localZone.timezone);
  const zoneLabels = highlighted
    .map((zone) => `${formatSegmentsForZone(segments, startMs, zone.timezone)} in ${zone.label}`)
    .join(", ");
  const hours = overlapSlotCount / SLOTS_PER_HOUR;
  return (
    <>
      Best overlapping {segments.length === 1 ? "window" : "windows"}: <strong>{hours}h total</strong> (local <strong>{localRanges}</strong>). That is {zoneLabels}.
    </>
  );
}
