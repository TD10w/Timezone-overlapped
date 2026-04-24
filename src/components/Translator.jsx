import TimezoneInput from "./TimezoneInput.jsx";
import { formatShortDate, getZonedParts, localTimeToUtc, pad } from "../lib/time.js";

export default function Translator({ state, onChange }) {
  const { translator } = state;
  let rows = [];
  try {
    const utcMs = localTimeToUtc(state.date, translator.time, translator.sourceTimezone);
    const sourceParts = getZonedParts(new Date(utcMs), translator.sourceTimezone);
    rows = state.zones.map((zone) => {
      const parts = getZonedParts(new Date(utcMs), zone.timezone);
      const dayDiff = Math.round(
        (Date.UTC(parts.year, parts.month - 1, parts.day) -
          Date.UTC(sourceParts.year, sourceParts.month - 1, sourceParts.day)) /
          (24 * 60 * 60 * 1000),
      );
      return { zone, parts, dayDiff };
    });
  } catch {
    rows = [];
  }

  return (
    <details className="translator-section">
      <summary className="translator-summary">
        <span className="translator-header">Time translator</span>
        <span className="translator-summary-copy">Convert one exact time across the pinned zones</span>
      </summary>
      <div className="translator-body">
        <div className="translator-input-row">
          <input
            className="translate-time-input"
            type="time"
            step="3600"
            value={translator.time}
            onChange={(event) => onChange({ time: event.target.value })}
          />
          <span className="translator-label">in</span>
          <TimezoneInput
            value={translator.sourceTimezone}
            onChange={(sourceTimezone) => onChange({ sourceTimezone })}
          />
          <span className="translator-label">on</span>
          <input
            className="translate-date-input"
            type="date"
            value={state.date}
            readOnly
            aria-label="Translator date"
          />
        </div>
        <div className="translate-results">
          {rows.map(({ zone, parts, dayDiff }) => (
            <div className="tr-row" key={zone.id}>
              <span className="tr-city">{zone.label}</span>
              <span className="tr-time">
                {pad(parts.hour)}:{pad(parts.minute)}
                {dayDiff !== 0 && <span className={`tr-day-badge ${dayDiff > 0 ? "tr-next" : "tr-prev"}`}>{dayDiff > 0 ? `+${dayDiff}d` : `${dayDiff}d`}</span>}
              </span>
              <span className="tr-date">{formatShortDate(parts)}</span>
              <span className="tr-tz">{zone.timezone}</span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
