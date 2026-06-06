import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MoodSelector from "./MoodSelector";

describe("MoodSelector Component", () => {
  const defaultProps = {
    selectedMood: null,
    onSelectMood: vi.fn(),
    isSubmitting: false
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 5 moods with correct emoji and label", () => {
    render(<MoodSelector {...defaultProps} />);

    const expectedMoods = [
      { emoji: "😄", label: "Energized" },
      { emoji: "🙂", label: "Okay" },
      { emoji: "😐", label: "Tired" },
      { emoji: "😟", label: "Anxious" },
      { emoji: "😔", label: "Burnt Out" }
    ];

    expectedMoods.forEach(({ emoji, label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(emoji)).toBeInTheDocument();
    });

    // Exactly 5 radio buttons
    const buttons = screen.getAllByRole("radio");
    expect(buttons).toHaveLength(5);
  });

  it("calls onSelectMood with the correct value when a mood is clicked", () => {
    const onSelectMood = vi.fn();
    render(<MoodSelector {...defaultProps} onSelectMood={onSelectMood} />);

    fireEvent.click(screen.getByLabelText("Feel Energized"));
    expect(onSelectMood).toHaveBeenCalledWith("Energized");

    fireEvent.click(screen.getByLabelText("Feel Anxious"));
    expect(onSelectMood).toHaveBeenCalledWith("Anxious");

    fireEvent.click(screen.getByLabelText("Feel Burnt Out"));
    expect(onSelectMood).toHaveBeenCalledWith("Burnt Out");

    expect(onSelectMood).toHaveBeenCalledTimes(3);
  });

  it("applies 'selected' class to the selected mood button", () => {
    render(<MoodSelector {...defaultProps} selectedMood="Okay" />);

    const okayBtn = screen.getByLabelText("Feel Okay");
    expect(okayBtn).toHaveClass("selected");

    // Other buttons should NOT have the selected class
    const energizedBtn = screen.getByLabelText("Feel Energized");
    expect(energizedBtn).not.toHaveClass("selected");

    const tiredBtn = screen.getByLabelText("Feel Tired");
    expect(tiredBtn).not.toHaveClass("selected");
  });

  it("disables all buttons when isSubmitting is true", () => {
    render(<MoodSelector {...defaultProps} isSubmitting={true} />);

    const buttons = screen.getAllByRole("radio");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("enables all buttons when isSubmitting is false", () => {
    render(<MoodSelector {...defaultProps} isSubmitting={false} />);

    const buttons = screen.getAllByRole("radio");
    buttons.forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it("sets aria-checked to true only for the selected mood", () => {
    render(<MoodSelector {...defaultProps} selectedMood="Tired" />);

    const tiredBtn = screen.getByLabelText("Feel Tired");
    expect(tiredBtn).toHaveAttribute("aria-checked", "true");

    // All other buttons should have aria-checked="false"
    const otherLabels = ["Feel Energized", "Feel Okay", "Feel Anxious", "Feel Burnt Out"];
    otherLabels.forEach((label) => {
      expect(screen.getByLabelText(label)).toHaveAttribute("aria-checked", "false");
    });
  });

  it("sets aria-checked to false for all moods when none is selected", () => {
    render(<MoodSelector {...defaultProps} selectedMood={null} />);

    const buttons = screen.getAllByRole("radio");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-checked", "false");
    });
  });

  it("renders within a radiogroup with proper aria-label", () => {
    render(<MoodSelector {...defaultProps} />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-label", "Daily mood selector");
  });
});
