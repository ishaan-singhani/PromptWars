import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "./Dashboard";

// Mock firebase getMoodHistory
vi.mock("../firebase", () => ({
  getMoodHistory: vi.fn()
}));

// Mock child components to simplify Dashboard testing
vi.mock("./EmptyState", () => ({
  default: () => <div data-testid="empty-state">Your MindBoard Dashboard is ready!</div>
}));

vi.mock("./StatsRow", () => ({
  default: ({ currentStreak, topTrigger }) => (
    <div data-testid="stats-row">
      Streak: {currentStreak || 0}, Trigger: {topTrigger || "None"}
    </div>
  )
}));

vi.mock("./MoodTrendChart", () => ({
  default: ({ lastSevenDays }) => (
    <div data-testid="mood-trend-chart">Chart with {lastSevenDays.length} days</div>
  )
}));

vi.mock("./InsightCard", () => ({
  default: ({ insight }) =>
    insight ? <div data-testid="insight-card">{insight.title}</div> : null
}));

import { getMoodHistory } from "../firebase";

describe("Dashboard Component", () => {
  const defaultProps = {
    uid: "test-user-id",
    studentInfo: {
      currentStreak: 3,
      targetExam: "JEE"
    }
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Keep getMoodHistory pending so loading state persists
    getMoodHistory.mockImplementation(() => new Promise(() => {}));

    render(<Dashboard {...defaultProps} />);

    const spinner = document.querySelector(".spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading dashboard analytics");
  });

  it("renders empty state when no mood history exists", async () => {
    getMoodHistory.mockResolvedValue([]);

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    expect(screen.getByText("Your MindBoard Dashboard is ready!")).toBeInTheDocument();
  });

  it("renders chart, stats, and insights after data loads", async () => {
    const mockHistory = [
      {
        id: "entry1",
        mood: "Energized",
        trigger: "Study Load",
        timestamp: new Date().toISOString()
      },
      {
        id: "entry2",
        mood: "Anxious",
        trigger: "Self-Doubt",
        timestamp: new Date().toISOString()
      }
    ];
    getMoodHistory.mockResolvedValue(mockHistory);

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("stats-row")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mood-trend-chart")).toBeInTheDocument();
    expect(screen.getByText("Chart with 7 days")).toBeInTheDocument();
  });

  it("passes streak data to StatsRow component", async () => {
    const mockHistory = [
      {
        id: "entry1",
        mood: "Okay",
        trigger: "Study Load",
        timestamp: new Date().toISOString()
      }
    ];
    getMoodHistory.mockResolvedValue(mockHistory);

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("stats-row")).toBeInTheDocument();
    });

    expect(screen.getByTestId("stats-row")).toHaveTextContent("Streak: 3");
  });

  it("shows insight card when history triggers insights", async () => {
    // Provide enough anxious entries to trigger the insight
    const mockHistory = [
      { id: "e1", mood: "Anxious", trigger: "Study Load", timestamp: new Date().toISOString() },
      { id: "e2", mood: "Anxious", trigger: "Study Load", timestamp: new Date().toISOString() },
      { id: "e3", mood: "Anxious", trigger: "Study Load", timestamp: new Date().toISOString() }
    ];
    getMoodHistory.mockResolvedValue(mockHistory);

    render(<Dashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("insight-card")).toBeInTheDocument();
    });

    expect(screen.getByText("Nervous System Check-In")).toBeInTheDocument();
  });

  it("does not crash when getMoodHistory rejects", async () => {
    getMoodHistory.mockRejectedValue(new Error("Firebase error"));

    // Suppress the expected console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<Dashboard {...defaultProps} />);

    // After the error, loading should finish and empty state should show
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("calls getMoodHistory with the correct uid", async () => {
    getMoodHistory.mockResolvedValue([]);

    render(<Dashboard {...defaultProps} uid="unique-user-42" />);

    await waitFor(() => {
      expect(getMoodHistory).toHaveBeenCalledWith("unique-user-42");
    });
  });
});
