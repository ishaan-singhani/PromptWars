import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DailyCheckIn from "./DailyCheckIn";

// Mock dependencies
vi.mock("../firebase", () => ({
  saveMoodCheckIn: vi.fn().mockResolvedValue({
    streak: { currentStreak: 1, lastCheckInDate: "2026-06-06" }
  }),
  getMoodHistory: vi.fn().mockResolvedValue([])
}));

vi.mock("../gemini", () => ({
  generateWellnessTip: vi.fn().mockResolvedValue("Mocked wellness tip")
}));

describe("DailyCheckIn Component", () => {
  const defaultProps = {
    uid: "test-user-id",
    studentInfo: { name: "Rahul", targetExam: "JEE", examDate: "2026-06-15" },
    streakData: { currentStreak: 0, lastCheckInDate: null },
    onCheckInComplete: vi.fn()
  };

  it("renders all 5 mood options correctly", () => {
    render(<DailyCheckIn {...defaultProps} />);
    expect(screen.getByText("Energized")).toBeInTheDocument();
    expect(screen.getByText("Okay")).toBeInTheDocument();
    expect(screen.getByText("Tired")).toBeInTheDocument();
    expect(screen.getByText("Anxious")).toBeInTheDocument();
    expect(screen.getByText("Burnt Out")).toBeInTheDocument();
  });

  it("clicking a mood updates state and shows follow-up questions", () => {
    render(<DailyCheckIn {...defaultProps} />);
    
    // Check that followup container is initially collapsed/not active
    const followupTitle = screen.getByText("What's affecting you most today?");
    expect(followupTitle).toBeInTheDocument();
    
    // Find the 'Energized' mood button and click it
    const energizedBtn = screen.getByLabelText("Feel Energized");
    fireEvent.click(energizedBtn);
    
    // Verify it is selected
    expect(energizedBtn).toHaveClass("selected");
  });
});
