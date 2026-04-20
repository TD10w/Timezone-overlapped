// Globe component — orthographic projection, drag to rotate, auto-spin, click to pin.
// Depends on: window.WORLD_POLYGONS, window.WORLD_CITIES

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Orthographic projection helpers ─────────────────────────────────────────
// rotation = { lambda, phi } in degrees. lambda = longitude offset, phi = latitude tilt.
// Point at (lon, lat) projects to (x, y) on the unit sphere, visible if z > 0.
function project(lon, lat, rotation, radius, cx, cy) {
  const toRad = Math.PI / 180;
  const l = (lon + rotation.lambda) * toRad;
  const p = lat * toRad;
  const phi = rotation.phi * toRad;

  // Rotate sphere
  const cosP = Math.cos(p);
  const x = cosP * Math.sin(l);
  const y0 = Math.sin(p);
  const z0 = cosP * Math.cos(l);

  // Tilt around x-axis by phi
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const y = y0 * cosPhi - z0 * sinPhi;
  const z = y0 * sinPhi + z0 * cosPhi;

  return {
    x: cx + x * radius,
    y: cy - y * radius,
    visible: z > -0.02, // small tolerance for on-edge points
    z,
  };
}

// Inverse: screen (x,y) -> lon/lat (or null if outside globe)
function unproject(sx, sy, rotation, radius, cx, cy) {
  const dx = (sx - cx) / radius;
  const dy = -(sy - cy) / radius;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) return null;
  const z = Math.sqrt(1 - d2);
  // Undo tilt
  const phi = rotation.phi * Math.PI / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const y0 = dy * cosPhi + z * sinPhi;
  const z0 = -dy * sinPhi + z * cosPhi;
  const x0 = dx;

  const lat = Math.asin(y0) * 180 / Math.PI;
  let lon = Math.atan2(x0, z0) * 180 / Math.PI - rotation.lambda;
  // normalize lon to [-180, 180]
  lon = ((lon + 540) % 360) - 180;
  return { lon, lat };
}

// Great-circle distance (degrees approx via haversine angle)
function gcDist(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*toRad) * Math.cos(lat2*toRad) * Math.sin(dLon/2)**2;
  return 2 * Math.asin(Math.sqrt(a));
}

function nearestCity(lat, lon) {
  let best = null;
  let bestD = Infinity;
  for (const c of window.WORLD_CITIES) {
    const d = gcDist(lat, lon, c.lat, c.lon);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

// ── Subsolar point (where sun is directly overhead at given UTC time) ──────
function subsolarPoint(date) {
  // Approximate solar longitude (sun hour angle) and declination.
  const d = date;
  const utcHours = d.getUTCHours() + d.getUTCMinutes()/60 + d.getUTCSeconds()/3600;
  // subsolar lon: 12:00 UTC sun over 0° lon (approx), so lon = -(utcHours - 12) * 15
  const lon = -(utcHours - 12) * 15;

  // declination approx — day of year
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const dayOfYear = (d.getTime() - start) / 86400000;
  const gamma = 2 * Math.PI * (dayOfYear - 1) / 365;
  // NOAA short formula
  const decl = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2*gamma)
    + 0.000907 * Math.sin(2*gamma)
    - 0.002697 * Math.cos(3*gamma)
    + 0.00148 * Math.sin(3*gamma);
  const lat = decl * 180 / Math.PI;
  return { lon, lat };
}

// Build path string for a continent ring, clipping invisible segments
function ringToPath(ring, rotation, radius, cx, cy) {
  let d = "";
  let pen = false;
  for (const [lon, lat] of ring) {
    const p = project(lon, lat, rotation, radius, cx, cy);
    if (p.visible) {
      if (!pen) { d += `M${p.x.toFixed(1)},${p.y.toFixed(1)}`; pen = true; }
      else d += `L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    } else {
      pen = false;
    }
  }
  return d;
}

// ── Main Globe component ───────────────────────────────────────────────────
function Globe({ size, pins, onPin, onUnpin, localTz, style, rotationMode, infoDensity }) {
  const radius = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;

  const [rotation, setRotation] = useState(() => {
    if (rotationMode === "centered") {
      // Rough center on local tz: use Date offset in minutes
      const offsetMin = new Date().getTimezoneOffset();
      return { lambda: -(offsetMin / 4), phi: -20 };
    }
    return { lambda: 0, phi: -15 };
  });
  const [now, setNow] = useState(() => new Date());
  const [hoverCoord, setHoverCoord] = useState(null);
  const dragRef = useRef(null);
  const autoSpinRef = useRef(rotationMode === "spin");
  const spinResumeTimerRef = useRef(null);
  const svgRef = useRef(null);

  const deferSpinResume = (ms = 2000) => {
    if (rotationMode !== "spin") return;
    autoSpinRef.current = false;
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current);
    spinResumeTimerRef.current = setTimeout(() => {
      autoSpinRef.current = true;
      spinResumeTimerRef.current = null;
    }, ms);
  };

  // Tick clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-spin
  useEffect(() => {
    if (rotationMode !== "spin") { autoSpinRef.current = false; return; }
    autoSpinRef.current = true;
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = t - last;
      last = t;
      if (autoSpinRef.current && !dragRef.current) {
        setRotation((r) => ({ ...r, lambda: r.lambda - dt * 0.008 }));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rotationMode]);

  // Drag handlers
  const onPointerDown = (e) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startLambda: rotation.lambda,
      startPhi: rotation.phi,
      moved: false,
    };
    svgRef.current.setPointerCapture(e.pointerId);
    autoSpinRef.current = false;
  };
  const onPointerMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const c = unproject(sx, sy, rotation, radius, cx, cy);
    setHoverCoord(c);

    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
      setRotation({
        lambda: dragRef.current.startLambda + dx * 0.4,
        phi: Math.max(-85, Math.min(85, dragRef.current.startPhi + dy * 0.4)),
      });
    }
  };
  const onPointerUp = (e) => {
    const wasMoved = dragRef.current?.moved;
    dragRef.current = null;
    try { svgRef.current.releasePointerCapture(e.pointerId); } catch {}
    // Drag release resumes spin immediately
    if (!wasMoved) {
      // click path — handled below; spin resume happens after pin/unpin via delay
    } else if (rotationMode === "spin") {
      autoSpinRef.current = true;
    }
    if (wasMoved) return;

    // click — first check if near an existing pin (click-to-remove)
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // Iterate over projected pins; if within 14px of one, unpin it (skip local)
    for (const pin of pins) {
      if (pin.id === "local") continue;
      const p = project(pin.lon, pin.lat, rotation, radius, cx, cy);
      if (!p.visible) continue;
      const dd = Math.hypot(p.x - sx, p.y - sy);
      if (dd <= 12) {
        if (onUnpin) onUnpin(pin);
        deferSpinResume(2000);
        return;
      }
    }

    const c = unproject(sx, sy, rotation, radius, cx, cy);
    if (!c) return;
    const city = nearestCity(c.lat, c.lon);
    if (!city) {
      if (rotationMode === "spin") autoSpinRef.current = true;
      return;
    }
    if (onPin) onPin(city);
    deferSpinResume(2000);
  };
  const onPointerLeave = () => { setHoverCoord(null); };

  // Subsolar point & night hemisphere center
  const sub = useMemo(() => subsolarPoint(now), [now]);
  const antiSun = { lon: sub.lon + 180, lat: -sub.lat };
  const antiP = project(antiSun.lon, antiSun.lat, rotation, radius, cx, cy);

  // Build continents path
  const landPaths = useMemo(() => {
    return window.WORLD_POLYGONS.map((poly, i) =>
      poly.map((ring) => ringToPath(ring, rotation, radius, cx, cy)).join(" ")
    );
  }, [rotation, radius, cx, cy]);

  // Graticule (lat/lon grid)
  const graticule = useMemo(() => {
    const lines = [];
    // Latitudes every 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 6) {
        const p = project(lon, lat, rotation, radius, cx, cy);
        if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        else pts.push(null);
      }
      let d = "";
      let pen = false;
      pts.forEach((pt) => {
        if (pt) { d += (pen ? "L" : "M") + pt; pen = true; }
        else pen = false;
      });
      lines.push(d);
    }
    // Meridians every 30°
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let lat = -85; lat <= 85; lat += 5) {
        const p = project(lon, lat, rotation, radius, cx, cy);
        if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        else pts.push(null);
      }
      let d = "";
      let pen = false;
      pts.forEach((pt) => {
        if (pt) { d += (pen ? "L" : "M") + pt; pen = true; }
        else pen = false;
      });
      lines.push(d);
    }
    return lines;
  }, [rotation, radius, cx, cy]);

  // Pin projections
  const pinProjs = pins.map((pin) => {
    const p = project(pin.lon, pin.lat, rotation, radius, cx, cy);
    return { ...pin, ...p };
  });

  // Hover city preview (nearest)
  const hoverCity = hoverCoord ? nearestCity(hoverCoord.lat, hoverCoord.lon) : null;

  // Style modifiers
  const isFilled = style === "filled";
  const isDotted = style === "dotted";

  return (
    <div className="globe-wrap" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        style={{ cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }}
      >
        <defs>
          {/* Ocean radial gradient */}
          <radialGradient id="oceanGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#262628" />
            <stop offset="70%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#141416" />
          </radialGradient>
          {/* Night shadow */}
          <radialGradient id="nightGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.45)" />
            <stop offset="95%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx={cx} cy={cy} r={radius} />
          </clipPath>
          {/* Dotted pattern */}
          {isDotted && (
            <pattern id="dotPat" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="0.9" fill="#f59e0b" opacity="0.75" />
            </pattern>
          )}
        </defs>

        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={radius + 2} fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />

        {/* Ocean disc */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#oceanGrad)" />

        {/* Clipped content */}
        <g clipPath="url(#globeClip)">
          {/* Graticule */}
          {graticule.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
          ))}
          {/* Equator + prime meridian highlighted */}
          <path
            d={(() => {
              const pts = [];
              for (let lon = -180; lon <= 180; lon += 4) {
                const p = project(lon, 0, rotation, radius, cx, cy);
                if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
                else pts.push(null);
              }
              let d = ""; let pen = false;
              pts.forEach((pt) => { if (pt) { d += (pen ? "L" : "M") + pt; pen = true; } else pen = false; });
              return d;
            })()}
            fill="none"
            stroke="rgba(245,158,11,0.22)"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />

          {/* Continents */}
          {landPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={
                isDotted ? "url(#dotPat)" :
                isFilled ? "rgba(245,158,11,0.22)" :
                "rgba(245,158,11,0.07)"
              }
              stroke={isDotted ? "none" : "rgba(245,158,11,0.85)"}
              strokeWidth={isFilled ? 0.7 : 1.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Night hemisphere shadow — circle centered on anti-solar point */}
          {antiP.visible && (
            <circle
              cx={antiP.x}
              cy={antiP.y}
              r={radius}
              fill="url(#nightGrad)"
              pointerEvents="none"
            />
          )}
        </g>

        {/* Subsolar marker (sun symbol) */}
        {(() => {
          const sp = project(sub.lon, sub.lat, rotation, radius, cx, cy);
          if (!sp.visible) return null;
          return (
            <g pointerEvents="none">
              <circle cx={sp.x} cy={sp.y} r={6} fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="1" />
              <circle cx={sp.x} cy={sp.y} r={2.2} fill="#f59e0b" />
            </g>
          );
        })()}

        {/* Outer rim */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" />

        {/* Pins */}
        {pinProjs.map((pin, i) => {
          if (!pin.visible) return null;
          const isHighlight = pin.isHighlighted !== false;
          const color = isHighlight ? "#f59e0b" : "#7a7a80";
          return (
            <g key={pin.id} pointerEvents="none">
              {/* halo */}
              <circle cx={pin.x} cy={pin.y} r="8" fill={color} opacity="0.15" />
              <circle cx={pin.x} cy={pin.y} r="4" fill={color} opacity="0.35" />
              <circle cx={pin.x} cy={pin.y} r="2.2" fill={color} stroke="#1c1c1e" strokeWidth="0.5" />
              <text
                x={pin.x + 8}
                y={pin.y - 6}
                fontSize="10"
                fill={color}
                fontFamily="SFMono-Regular, Menlo, monospace"
                style={{ textShadow: "0 0 3px #1c1c1e, 0 0 3px #1c1c1e" }}
              >
                {pin.label}
              </text>
            </g>
          );
        })}

        {/* Hover crosshair */}
        {hoverCoord && !dragRef.current && (() => {
          const p = project(hoverCoord.lon, hoverCoord.lat, rotation, radius, cx, cy);
          if (!p.visible) return null;
          return (
            <g pointerEvents="none">
              <circle cx={p.x} cy={p.y} r="10" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
              <line x1={p.x - 14} y1={p.y} x2={p.x - 6} y2={p.y} stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
              <line x1={p.x + 6} y1={p.y} x2={p.x + 14} y2={p.y} stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
              <line x1={p.x} y1={p.y - 14} x2={p.x} y2={p.y - 6} stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
              <line x1={p.x} y1={p.y + 6} x2={p.x} y2={p.y + 14} stroke="rgba(245,158,11,0.5)" strokeWidth="0.8" />
            </g>
          );
        })()}
      </svg>

      {/* HUD */}
      <div className="globe-hud">
        <div className="hud-row">
          <span className="hud-label">LAT</span>
          <span className="hud-val">{hoverCoord ? hoverCoord.lat.toFixed(2) : "——.——"}°</span>
        </div>
        <div className="hud-row">
          <span className="hud-label">LON</span>
          <span className="hud-val">{hoverCoord ? hoverCoord.lon.toFixed(2) : "——.——"}°</span>
        </div>
        <div className="hud-row">
          <span className="hud-label">NEAREST</span>
          <span className="hud-val hud-city">{hoverCity ? hoverCity.name : "—"}</span>
        </div>
      </div>
    </div>
  );
}

window.Globe = Globe;
window.__globeHelpers = { nearestCity, project, unproject };
