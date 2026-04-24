import { useMemo } from "react";

export default function TimezoneInput({ value, onChange, label = "Source timezone" }) {
  const options = useMemo(() => {
    if (typeof Intl.supportedValuesOf === "function") return Intl.supportedValuesOf("timeZone");
    return ["UTC", "Asia/Shanghai", "America/Los_Angeles", "America/New_York", "Europe/London", "Asia/Tokyo"];
  }, []);

  return (
    <div className="tz-combobox translator-tz-wrap">
      <input
        type="text"
        list="timezone-options"
        autoComplete="off"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          const next = event.target.value.trim();
          if (options.includes(next) || next === "UTC") onChange(next);
        }}
      />
      <span className="combobox-arrow" aria-hidden="true">v</span>
      <datalist id="timezone-options">
        {options.map((tz) => <option value={tz} key={tz} />)}
      </datalist>
    </div>
  );
}
