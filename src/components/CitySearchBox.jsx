import { useMemo, useRef, useState } from "react";
import { searchCities } from "../lib/citySearch.js";

export default function CitySearchBox({ pinnedTimezones = [], onSelect, placeholder = "Search a city to pin..." }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const pinnedSet = useMemo(() => new Set(pinnedTimezones), [pinnedTimezones]);
  const results = useMemo(() => searchCities(query), [query]);

  const pick = (city) => {
    setQuery("");
    setOpen(false);
    setActiveIdx(0);
    inputRef.current?.blur();
    onSelect(city);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIdx((idx) => Math.min(results.length - 1, idx + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIdx((idx) => Math.max(0, idx - 1));
    } else if (event.key === "Enter" && results[activeIdx]) {
      event.preventDefault();
      pick(results[activeIdx]);
    }
  };

  return (
    <div className="globe-search city-search">
      <svg className="globe-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11 L14 14" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        className="globe-search-input"
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {open && query.trim() && (
        <div className="globe-search-results">
          {results.length === 0 ? (
            <div className="globe-search-empty">No cities match "{query}"</div>
          ) : results.map((city, index) => {
            const isPinned = pinnedSet.has(city.tz);
            return (
              <button
                key={city.id}
                type="button"
                className={`globe-search-result${index === activeIdx ? " is-active" : ""}`}
                onMouseEnter={() => setActiveIdx(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(city);
                }}
              >
                <span className="globe-search-result-name">
                  {city.name}, {city.country}
                  {isPinned && <span className="pinned-dot">pinned</span>}
                </span>
                <span className="globe-search-result-tz">{city.tz}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
