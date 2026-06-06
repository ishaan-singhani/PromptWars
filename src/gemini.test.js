import { describe, it, expect, vi } from "vitest";
import { generateWellnessTip } from "./gemini";

// Mock the GoogleGenerativeAI module to prevent network requests during tests
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => "Mocked AI Reframing Tip"
            }
          })
        })
      };
    })
  };
});

describe("generateWellnessTip", () => {
  const studentInfo = {
    name: "Rahul",
    targetExam: "JEE",
    examDate: "2026-06-15"
  };

  it("should return fallback tip customized with student name and exam", async () => {
    // When no API key is set in environment variables, it will use the fallback templates
    const tip = await generateWellnessTip(studentInfo, "Anxious", "Study Load");
    expect(tip).toContain("Rahul");
    expect(tip).toContain("JEE");
    expect(tip).toContain("breath");
  });

  it("should return default fallback tip for unknown triggers or moods", async () => {
    const tip = await generateWellnessTip(studentInfo, "UnknownMood", "UnknownTrigger");
    expect(tip).toContain("Rahul");
    expect(tip).toContain("JEE");
  });
});
