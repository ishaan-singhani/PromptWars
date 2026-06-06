import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BoxBreathing from "./BoxBreathing";

describe("BoxBreathing Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly with initial states", () => {
    render(<BoxBreathing />);
    expect(screen.getByText("Box Breathing")).toBeInTheDocument();
    expect(screen.getByText("Ready when you are")).toBeInTheDocument();
    expect(screen.getByText("Total Time: 4:00")).toBeInTheDocument();
  });

  it("starts the exercise on click and toggles the start/pause button", () => {
    render(<BoxBreathing />);
    
    const startBtn = screen.getByRole("button", { name: /Start box breathing/i });
    
    // Start the exercise
    fireEvent.click(startBtn);
    expect(startBtn).toHaveTextContent("Pause");
    expect(screen.getByText("Hold & Relax")).toBeInTheDocument(); // Initial phase is 'hold-exhale'

    // Pause the exercise
    fireEvent.click(startBtn);
    expect(startBtn).toHaveTextContent("Start");
  });

  it("cycles through breathing phases correctly with timer countdowns", () => {
    render(<BoxBreathing />);
    
    const startBtn = screen.getByRole("button", { name: /Start box breathing/i });
    fireEvent.click(startBtn);

    // Initial phase: Hold & Relax (starts at 4 seconds)
    expect(screen.getByText("Hold & Relax")).toBeInTheDocument();
    
    // Advance 4 seconds: should transition to 'inhale' phase -> "Breathe In"
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Breathe In")).toBeInTheDocument();

    // Advance 4 seconds: should transition to 'hold-inhale' phase -> "Hold"
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Hold")).toBeInTheDocument();

    // Advance 4 seconds: should transition to 'exhale' phase -> "Breathe Out"
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Breathe Out")).toBeInTheDocument();

    // Advance 4 seconds: should transition to 'hold-exhale' phase -> "Hold & Relax"
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Hold & Relax")).toBeInTheDocument();
  });

  it("resets breathing parameters when Reset button is clicked", () => {
    render(<BoxBreathing />);
    
    const startBtn = screen.getByRole("button", { name: /Start box breathing/i });
    const resetBtn = screen.getByRole("button", { name: /Reset breathing exercise/i });
    
    fireEvent.click(startBtn);
    
    act(() => {
      vi.advanceTimersByTime(4000); // Transitions to Breathe In
    });
    expect(screen.getByText("Breathe In")).toBeInTheDocument();

    // Reset exercise
    fireEvent.click(resetBtn);
    expect(screen.getByText("Ready when you are")).toBeInTheDocument();
    expect(startBtn).toHaveTextContent("Start");
    expect(screen.getByText("Total Time: 4:00")).toBeInTheDocument();
  });
});
