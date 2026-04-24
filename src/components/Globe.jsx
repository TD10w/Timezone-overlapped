import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WORLD_POLYGONS } from "../data/world.js";
import { nearestCity } from "../lib/citySearch.js";

function project(lon, lat, rotation, radius, cx, cy) {
  const toRad = Math.PI / 180;
  const l = (lon + rotation.lambda) * toRad;
  const p = lat * toRad;
  const phi = rotation.phi * toRad;
  const cosP = Math.cos(p);
  const x = cosP * Math.sin(l);
  const y0 = Math.sin(p);
  const z0 = cosP * Math.cos(l);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const y = y0 * cosPhi - z0 * sinPhi;
  const z = y0 * sinPhi + z0 * cosPhi;
  return { x: cx + x * radius, y: cy - y * radius, visible: z > -0.02, z };
}

function unproject(sx, sy, rotation, radius, cx, cy) {
  const dx = (sx - cx) / radius;
  const dy = -(sy - cy) / radius;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) return null;
  const z = Math.sqrt(1 - d2);
  const phi = rotation.phi * Math.PI / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const y0 = dy * cosPhi + z * sinPhi;
  const z0 = -dy * sinPhi + z * cosPhi;
  const lat = Math.asin(y0) * 180 / Math.PI;
  let lon = Math.atan2(dx, z0) * 180 / Math.PI - rotation.lambda;
  lon = ((lon + 540) % 360) - 180;
  return { lon, lat };
}

function subsolarPoint(date) {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = -(utcHours - 12) * 15;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = (date.getTime() - start) / 86400000;
  const gamma = 2 * Math.PI * (dayOfYear - 1) / 365;
  const decl = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma);
  return { lon, lat: decl * 180 / Math.PI };
}

function ringToPath(ring, rotation, radius, cx, cy) {
  let d = "";
  let pen = false;
  for (const [lon, lat] of ring) {
    const p = project(lon, lat, rotation, radius, cx, cy);
    if (p.visible) {
      d += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      pen = true;
    } else {
      pen = false;
    }
  }
  return d;
}

function rotationForPin(pin) {
  if (!pin) return { lambda: -105, phi: 0 };
  return {
    lambda: -pin.lon,
    phi: 0,
  };
}

export default function Globe({ size, pins, onPin, onUnpin, style, rotationMode, focusTarget }) {
  const radius = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const localPin = useMemo(() => pins.find((pin) => pin.id === "local") || pins[0], [pins]);
  const [rotation, setRotation] = useState(() => rotationForPin(localPin));
  const [now, setNow] = useState(() => new Date());
  const [hoverCoord, setHoverCoord] = useState(null);
  const dragRef = useRef(null);
  const hoverRef = useRef(false);
  const autoSpinRef = useRef(rotationMode === "spin");
  const spinResumeTimerRef = useRef(null);
  const svgRef = useRef(null);
  const animRef = useRef(null);
  const prevPinIdsRef = useRef(new Set());

  const newPinIds = useMemo(() => {
    const prev = prevPinIdsRef.current;
    const cur = new Set(pins.map((pin) => pin.id));
    const added = new Set();
    cur.forEach((id) => { if (!prev.has(id)) added.add(id); });
    prevPinIdsRef.current = cur;
    return added;
  }, [pins]);

  const deferSpinResume = useCallback((ms = 2000) => {
    if (rotationMode !== "spin") return;
    autoSpinRef.current = false;
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current);
    spinResumeTimerRef.current = setTimeout(() => {
      autoSpinRef.current = true;
      spinResumeTimerRef.current = null;
    }, ms);
  }, [rotationMode]);

  const animateTo = useCallback((targetLon, targetLat) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    autoSpinRef.current = false;
    if (spinResumeTimerRef.current) clearTimeout(spinResumeTimerRef.current);
    const startLambda = rotation.lambda;
    const startPhi = rotation.phi;
    let endLambda = -targetLon;
    let delta = endLambda - startLambda;
    delta = ((delta + 180) % 360 + 360) % 360 - 180;
    endLambda = startLambda + delta;
    const endPhi = Math.max(-70, Math.min(70, -targetLat));
    const duration = 800;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = k < 0.5 ? 4 * k * k * k : 1 - ((-2 * k + 2) ** 3) / 2;
      setRotation({ lambda: startLambda + (endLambda - startLambda) * e, phi: startPhi + (endPhi - startPhi) * e });
      if (k < 1) animRef.current = requestAnimationFrame(step);
      else {
        animRef.current = null;
        deferSpinResume(2000);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [deferSpinResume, rotation.lambda, rotation.phi]);

  useEffect(() => {
    if (focusTarget) animateTo(focusTarget.lon, focusTarget.lat);
  }, [animateTo, focusTarget]);

  useEffect(() => {
    if (rotationMode === "centered" && localPin) animateTo(localPin.lon, localPin.lat);
  }, [animateTo, localPin, rotationMode]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (rotationMode !== "spin") {
      autoSpinRef.current = false;
      return undefined;
    }
    autoSpinRef.current = true;
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = t - last;
      last = t;
      if (autoSpinRef.current && !dragRef.current && !hoverRef.current) {
        setRotation((r) => ({ ...r, lambda: r.lambda - dt * 0.008 }));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rotationMode]);

  const onPointerDown = (event) => {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startLambda: rotation.lambda,
      startPhi: rotation.phi,
      moved: false,
    };
    svgRef.current.setPointerCapture(event.pointerId);
    autoSpinRef.current = false;
  };

  const onPointerMove = (event) => {
    hoverRef.current = true;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const c = unproject(sx, sy, rotation, radius, cx, cy);
    setHoverCoord(c);
    if (dragRef.current) {
      const dx = event.clientX - dragRef.current.startX;
      const dy = event.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
      setRotation({
        lambda: dragRef.current.startLambda + dx * 0.4,
        phi: Math.max(-85, Math.min(85, dragRef.current.startPhi + dy * 0.4)),
      });
    }
  };

  const onPointerUp = (event) => {
    const wasMoved = dragRef.current?.moved;
    dragRef.current = null;
    try { svgRef.current.releasePointerCapture(event.pointerId); } catch {}
    if (wasMoved) {
      if (rotationMode === "spin") autoSpinRef.current = true;
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    for (const pin of pins) {
      const p = project(pin.lon, pin.lat, rotation, radius, cx, cy);
      if (p.visible && Math.hypot(p.x - sx, p.y - sy) <= 12) {
        onUnpin(pin);
        deferSpinResume(2000);
        return;
      }
    }

    const c = unproject(sx, sy, rotation, radius, cx, cy);
    if (!c) return;
    const city = nearestCity(c.lat, c.lon);
    if (city) onPin(city);
    deferSpinResume(2000);
  };

  const sub = useMemo(() => subsolarPoint(now), [now]);
  const antiP = project(sub.lon + 180, -sub.lat, rotation, radius, cx, cy);
  const isFilled = style === "filled";
  const isDotted = style === "dotted";
  const landPaths = useMemo(() => WORLD_POLYGONS.map((poly) => poly.map((ring) => ringToPath(ring, rotation, radius, cx, cy)).join(" ")), [rotation, radius, cx, cy]);
  const graticule = useMemo(() => buildGraticule(rotation, radius, cx, cy), [rotation, radius, cx, cy]);
  const pinProjs = pins.map((pin) => ({ ...pin, ...project(pin.lon, pin.lat, rotation, radius, cx, cy) }));
  const hoverCity = hoverCoord ? nearestCity(hoverCoord.lat, hoverCoord.lon) : null;
  const hoverCityTime = hoverCity ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone: hoverCity.tz, hour12: false }).format(now) : null;

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
        onPointerLeave={() => { hoverRef.current = false; setHoverCoord(null); }}
        style={{ cursor: dragRef.current ? "grabbing" : "grab", touchAction: "none" }}
      >
        <defs>
          <radialGradient id="oceanGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#262628" />
            <stop offset="70%" stopColor="#1c1c1e" />
            <stop offset="100%" stopColor="#141416" />
          </radialGradient>
          <radialGradient id="nightGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.45)" />
            <stop offset="95%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <clipPath id="globeClip"><circle cx={cx} cy={cy} r={radius} /></clipPath>
          {isDotted && (
            <pattern id="dotPat" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="0.9" fill="#f59e0b" opacity="0.75" />
            </pattern>
          )}
        </defs>
        <circle cx={cx} cy={cy} r={radius + 6} fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={radius + 2} fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={radius} fill="url(#oceanGrad)" />
        <g clipPath="url(#globeClip)">
          {graticule.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />)}
          {landPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={isDotted ? "url(#dotPat)" : isFilled ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.07)"}
              stroke={isDotted ? "none" : "rgba(245,158,11,0.85)"}
              strokeWidth={isFilled ? 0.7 : 1.2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {antiP.visible && <circle cx={antiP.x} cy={antiP.y} r={radius} fill="url(#nightGrad)" pointerEvents="none" />}
        </g>
        <SunMarker sub={sub} rotation={rotation} radius={radius} cx={cx} cy={cy} />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(245,158,11,0.45)" strokeWidth="1.2" />
        {pinProjs.map((pin) => {
          if (!pin.visible) return null;
          const color = pin.highlighted === false ? "#7a7a80" : "#f59e0b";
          const isNew = newPinIds.has(pin.id);
          return (
            <g key={pin.id} pointerEvents="none" className={isNew ? "globe-pin globe-pin-new" : "globe-pin"}>
              {isNew && (
                <>
                  <circle cx={pin.x} cy={pin.y} r="4" fill="none" stroke={color} strokeWidth="1.5" className="globe-pin-ripple" />
                  <circle cx={pin.x} cy={pin.y} r="4" fill="none" stroke={color} strokeWidth="1" className="globe-pin-ripple globe-pin-ripple-2" />
                </>
              )}
              <circle cx={pin.x} cy={pin.y} r="8" fill={color} opacity="0.15" className="globe-pin-halo" />
              <circle cx={pin.x} cy={pin.y} r="4" fill={color} opacity="0.35" className="globe-pin-halo" />
              <circle cx={pin.x} cy={pin.y} r="2.2" fill={color} stroke="#1c1c1e" strokeWidth="0.5" className="globe-pin-dot" />
              <text x={pin.x + 8} y={pin.y - 6} fontSize="10" fill={color} fontFamily="SFMono-Regular, Menlo, monospace" className="globe-pin-label">
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="globe-hud">
        <div className="hud-row"><span className="hud-label">LAT</span><span className="hud-val">{hoverCoord ? hoverCoord.lat.toFixed(2) : "--.--"} deg</span></div>
        <div className="hud-row"><span className="hud-label">LON</span><span className="hud-val">{hoverCoord ? hoverCoord.lon.toFixed(2) : "--.--"} deg</span></div>
        <div className="hud-row"><span className="hud-label">NEAREST</span><span className="hud-val hud-city">{hoverCity ? hoverCity.name : "-"}</span></div>
        <div className="hud-row"><span className="hud-label">TIME</span><span className="hud-val">{hoverCityTime || "--:--"}</span></div>
        {hoverCity && <div className="hud-hint">click to pin {hoverCity.name}</div>}
      </div>
    </div>
  );
}

function SunMarker({ sub, rotation, radius, cx, cy }) {
  const sp = project(sub.lon, sub.lat, rotation, radius, cx, cy);
  if (!sp.visible) return null;
  return (
    <g pointerEvents="none">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = deg * Math.PI / 180;
        return <line key={deg} x1={sp.x + Math.cos(rad) * 5.5} y1={sp.y + Math.sin(rad) * 5.5} x2={sp.x + Math.cos(rad) * 8.5} y2={sp.y + Math.sin(rad) * 8.5} stroke="rgba(245,158,11,0.5)" strokeWidth="1.2" strokeLinecap="round" />;
      })}
      <circle cx={sp.x} cy={sp.y} r={4} fill="rgba(245,158,11,0.25)" />
      <circle cx={sp.x} cy={sp.y} r={2.5} fill="#f59e0b" opacity="0.85" />
    </g>
  );
}

function buildGraticule(rotation, radius, cx, cy) {
  const lines = [];
  const addLine = (points) => {
    let d = "";
    let pen = false;
    points.forEach((pt) => {
      if (pt) {
        d += `${pen ? "L" : "M"}${pt}`;
        pen = true;
      } else {
        pen = false;
      }
    });
    lines.push(d);
  };

  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 6) {
      const p = project(lon, lat, rotation, radius, cx, cy);
      pts.push(p.visible ? `${p.x.toFixed(1)},${p.y.toFixed(1)}` : null);
    }
    addLine(pts);
  }

  for (let lon = -180; lon < 180; lon += 30) {
    const pts = [];
    for (let lat = -85; lat <= 85; lat += 5) {
      const p = project(lon, lat, rotation, radius, cx, cy);
      pts.push(p.visible ? `${p.x.toFixed(1)},${p.y.toFixed(1)}` : null);
    }
    addLine(pts);
  }
  return lines;
}
