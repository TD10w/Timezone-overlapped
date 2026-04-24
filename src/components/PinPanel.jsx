import { formatZonedTime, timeOfDayIcon, tzOffsetMinutes } from "../lib/time.js";

export default function PinPanel({ zones, now, localTimezone, infoDensity, onRemove }) {
  return (
    <div className="pin-panel" id="pin-panel">
      <div className="pin-panel-header">
        <span className="pin-panel-title">Pinned Times</span>
        <span className="pin-panel-count">{zones.length} {zones.length === 1 ? "zone" : "zones"}</span>
      </div>
      {zones.map((zone) => (
        <PinCard
          key={zone.id}
          zone={zone}
          now={now}
          isLocal={zone.id === "local"}
          infoDensity={infoDensity}
          localTimezone={localTimezone}
          onRemove={() => onRemove(zone.id)}
        />
      ))}
    </div>
  );
}

function PinCard({ zone, now, isLocal, infoDensity, localTimezone, onRemove }) {
  const timeStr = formatZonedTime(now, zone.timezone);
  const sec = new Intl.DateTimeFormat("en-GB", { timeZone: zone.timezone, second: "2-digit", hour12: false }).format(now);
  const dateStr = new Intl.DateTimeFormat(undefined, { timeZone: zone.timezone, weekday: "short", month: "short", day: "numeric" }).format(now);
  const icon = timeOfDayIcon(now, zone.timezone);
  const offset = tzOffsetMinutes(now, zone.timezone) - tzOffsetMinutes(now, localTimezone);
  const hours = offset / 60;
  const deltaStr = hours === 0 ? "same as you" : `${hours > 0 ? "+" : ""}${Number.isInteger(hours) ? hours : hours.toFixed(1)}h from you`;

  return (
    <div className={`pin-card${isLocal ? " is-local" : ""}${zone.highlighted ? "" : " is-dim"}`}>
      {!isLocal && <button className="pc-remove" type="button" onClick={onRemove} title="Remove">x</button>}
      <div className="pc-top">
        <span>{isLocal ? "LOCAL" : "PINNED"}</span>
        <span className="pc-icon">{icon}</span>
      </div>
      <div className="pc-time">
        {timeStr}
        {infoDensity !== "minimal" && <span className="pc-seconds">:{sec}</span>}
      </div>
      <div className="pc-city">{zone.label}</div>
      {infoDensity === "detailed" && (
        <>
          <div className="pc-meta">{dateStr}</div>
          <div className="pc-meta pc-meta-tz">{zone.timezone}</div>
        </>
      )}
      {infoDensity === "delta" && <div className={`pc-delta${deltaStr === "same as you" ? " pc-delta-zero" : ""}`}>{deltaStr}</div>}
      {infoDensity === "minimal" && <div className="pc-meta">{dateStr.split(",")[0]}</div>}
    </div>
  );
}
