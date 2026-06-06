import { describe, it, expect } from "vitest";
import { isValidMood, isValidTrigger, isValidStudentInfo } from "./validation";

describe("isValidMood", () => {
  it("returns true for all 5 valid moods", () => {
    const validMoods = ["Energized", "Okay", "Tired", "Anxious", "Burnt Out"];
    validMoods.forEach((mood) => {
      expect(isValidMood(mood)).toBe(true);
    });
  });

  it("returns false for an empty string", () => {
    expect(isValidMood("")).toBe(false);
  });

  it("returns false for an unknown value", () => {
    expect(isValidMood("Happy")).toBe(false);
    expect(isValidMood("Sad")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isValidMood(null)).toBe(false);
    expect(isValidMood(undefined)).toBe(false);
  });

  it("returns false for non-string types", () => {
    expect(isValidMood(123)).toBe(false);
    expect(isValidMood({})).toBe(false);
  });
});

describe("isValidTrigger", () => {
  it("returns true for all 7 valid triggers", () => {
    const validTriggers = [
      "Study Load",
      "Self-Doubt",
      "Family Pressure",
      "Fear of Failure",
      "Sleep Issues",
      "Comparison with Others",
      "Physical Health"
    ];
    validTriggers.forEach((trigger) => {
      expect(isValidTrigger(trigger)).toBe(true);
    });
  });

  it("returns false for an empty string", () => {
    expect(isValidTrigger("")).toBe(false);
  });

  it("returns false for unknown values", () => {
    expect(isValidTrigger("Work Stress")).toBe(false);
    expect(isValidTrigger("Money Issues")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isValidTrigger(null)).toBe(false);
    expect(isValidTrigger(undefined)).toBe(false);
  });
});

describe("isValidStudentInfo", () => {
  it("returns false when name is empty", () => {
    expect(isValidStudentInfo({ name: "", targetExam: "JEE", examDate: "2026-06-01" })).toBe(false);
  });

  it("returns false when name is only whitespace", () => {
    expect(isValidStudentInfo({ name: "   ", targetExam: "JEE", examDate: "2026-06-01" })).toBe(false);
  });

  it("returns false when targetExam is missing", () => {
    expect(isValidStudentInfo({ name: "Rahul", targetExam: "", examDate: "2026-06-01" })).toBe(false);
  });

  it("returns false when targetExam is invalid", () => {
    expect(isValidStudentInfo({ name: "Rahul", targetExam: "SAT", examDate: "2026-06-01" })).toBe(false);
  });

  it("returns true for a complete valid object", () => {
    expect(isValidStudentInfo({ name: "Rahul", targetExam: "JEE", examDate: "2026-06-01" })).toBe(true);
  });

  it("returns true when examDate is null (optional)", () => {
    expect(isValidStudentInfo({ name: "Priya", targetExam: "NEET", examDate: null })).toBe(true);
  });

  it("returns true for all valid exam types", () => {
    const validExams = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC", "CBSE Board", "ICSE/ISC Board", "State Board"];
    validExams.forEach((exam) => {
      expect(isValidStudentInfo({ name: "Test", targetExam: exam })).toBe(true);
    });
  });

  it("returns false for null input", () => {
    expect(isValidStudentInfo(null)).toBe(false);
  });

  it("returns false for undefined input", () => {
    expect(isValidStudentInfo(undefined)).toBe(false);
  });
});
