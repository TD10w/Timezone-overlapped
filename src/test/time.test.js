import { describe, expect, it } from "vitest";
import { buildTimeline, getSlotSegments, isMinuteInWindow, tzOffsetMinutes } from "../lib/time.js";

describe("time overlap", () => {
  it("calculates a normal 7 hour overlap at hourly precision", () => {
    const zones = [
      { id: "a", timezone: "UTC", start: "09:00", end: "17:00", highlighted: true },
      { id: "b", timezone: "UTC", start: "10:00", end: "18:00", highlighted: true },
    ];
    const timeline = buildTimeline("2026-04-24", zones);
    expect(timeline.overlapSlots.size).toBe(7);
  });

  it("supports overnight windows", () => {
    expect(isMinuteInWindow(23 * 60, "22:00", "02:00")).toBe(true);
    expect(isMinuteInWindow(60, "22:00", "02:00")).toBe(true);
    expect(isMinuteInWindow(12 * 60, "22:00", "02:00")).toBe(false);
  });

  it("groups wrapped slot segments", () => {
    const slots = new Set([0, 1, 22, 23]);
    expect(getSlotSegments(slots)).toEqual([{ start: 22, end: 2 }]);
  });

  it("reflects DST offset changes for the same timezone", () => {
    const winter = tzOffsetMinutes(new Date(Date.UTC(2026, 0, 15, 12)), "America/New_York");
    const summer = tzOffsetMinutes(new Date(Date.UTC(2026, 6, 15, 12)), "America/New_York");
    expect(summer - winter).toBe(60);
  });
});
