import { describe, it, expect, beforeEach } from "vitest";
import { saveMoodCheckIn, getMoodHistory, isUsingMock, getLocalDateString } from "./firebase";

// Mock localStorage for test environment consistency
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("Firebase / Local Mock Database Utility Functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("verifies mock mode is active when firebase is not configured", () => {
    expect(isUsingMock()).toBe(true);
  });

  it("saveMoodCheckIn saves correct data shape and updates streak", async () => {
    const result = await saveMoodCheckIn("test-uid", "Energized", "Study Load");
    expect(result).toBeDefined();
    expect(result.entry).toBeDefined();
    expect(result.entry.mood).toBe("Energized");
    expect(result.entry.trigger).toBe("Study Load");
    expect(result.streak).toBeDefined();
    expect(result.streak.currentStreak).toBe(1);
  });

  it("getMoodHistory returns array of logged check-ins", async () => {
    // Add two mock entries
    await saveMoodCheckIn("test-uid", "Energized", "Study Load");
    await saveMoodCheckIn("test-uid", "Anxious", "Self-Doubt");
    
    const history = await getMoodHistory("test-uid");
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(2);
    expect(history[0].mood).toBe("Energized");
    expect(history[1].mood).toBe("Anxious");
  });

  describe("getLocalDateString helper utility", () => {
    it("formats dates correctly as YYYY-MM-DD", () => {
      const date = new Date(2026, 5, 6); // 2026-06-06 (June is 5)
      expect(getLocalDateString(date)).toBe("2026-06-06");
    });

    it("pads single digit months and days with leading zeros", () => {
      const date = new Date(2026, 0, 2); // 2026-01-02 (January is 0)
      expect(getLocalDateString(date)).toBe("2026-01-02");
    });
  });
});
