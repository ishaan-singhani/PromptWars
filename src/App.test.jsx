import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock Firebase module
vi.mock("./firebase", () => ({
  loginStudent: vi.fn().mockResolvedValue({ uid: "mock-uid" }),
  fetchOnboarding: vi.fn().mockResolvedValue(null), // returns null to show onboarding form
  getStreak: vi.fn().mockResolvedValue({ currentStreak: 0, lastCheckInDate: null }),
  onAuthStateChangedListener: vi.fn((callback) => {
    callback({ uid: "mock-uid" });
    return () => {};
  }),
  isUsingMock: vi.fn().mockReturnValue(true),
  saveOnboarding: vi.fn().mockResolvedValue({})
}));

describe("App Root Component", () => {
  it("renders onboarding form without crashing on first launch", async () => {
    render(<App />);
    const welcomeText = await screen.findByText("Welcome to MindBoard");
    expect(welcomeText).toBeInTheDocument();
  });
});
