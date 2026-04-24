import { describe, expect, it } from "vitest";
import { createDefaultState, decodeState, encodeState, normalizeState } from "../lib/state.js";

describe("state serialization", () => {
  it("round-trips full app state through base64url json", () => {
    const state = createDefaultState("Asia/Shanghai", new Date(2026, 3, 24, 9, 30));
    const decoded = decodeState(encodeState(state));
    expect(decoded).toEqual(state);
  });

  it("normalizes malformed state with safe defaults", () => {
    const fallback = createDefaultState("UTC", new Date(2026, 3, 24, 9, 30));
    const normalized = normalizeState({ zones: [{ timezone: "Europe/London" }] }, fallback);
    expect(normalized.version).toBe(1);
    expect(normalized.zones[0].id).toBe("local");
    expect(normalized.zones[1].timezone).toBe("Europe/London");
    expect(normalized.zones[1].start).toBe("09:00");
  });
});
