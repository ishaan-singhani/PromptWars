import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Onboarding from "./Onboarding";

// Mock firebase saveOnboarding
vi.mock("../firebase", () => ({
  saveOnboarding: vi.fn().mockResolvedValue({
    name: "Rahul",
    targetExam: "JEE",
    examDate: null,
    onboardedAt: "2026-06-06T00:00:00.000Z"
  })
}));

// Import the mocked function to assert on it
import { saveOnboarding } from "../firebase";

describe("Onboarding Component", () => {
  const defaultProps = {
    uid: "test-user-id",
    onComplete: vi.fn()
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the welcome heading", () => {
    render(<Onboarding {...defaultProps} />);
    expect(screen.getByText("Welcome to MindBoard")).toBeInTheDocument();
  });

  it("renders name input field", () => {
    render(<Onboarding {...defaultProps} />);
    const nameInput = screen.getByLabelText("Student name");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("type", "text");
    expect(nameInput).toHaveAttribute("placeholder", "Your name");
  });

  it("renders exam dropdown with options", () => {
    render(<Onboarding {...defaultProps} />);
    const examSelect = screen.getByLabelText("Target exam selection");
    expect(examSelect).toBeInTheDocument();

    // Check some exam options exist
    expect(screen.getByText("NEET (Medical)")).toBeInTheDocument();
    expect(screen.getByText("JEE (Engineering)")).toBeInTheDocument();
    expect(screen.getByText("UPSC (Civil Services)")).toBeInTheDocument();
  });

  it("renders date input field", () => {
    render(<Onboarding {...defaultProps} />);
    const dateInput = screen.getByLabelText("Target exam date");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("type", "date");
  });

  it("renders submit button with initial text", () => {
    render(<Onboarding {...defaultProps} />);
    const submitBtn = screen.getByLabelText("Start your MindBoard journey");
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toHaveTextContent("Begin Journey →");
  });

  it("shows validation error when name is empty on submit", async () => {
    render(<Onboarding {...defaultProps} />);

    // Select an exam but leave name empty
    fireEvent.change(screen.getByLabelText("Target exam selection"), {
      target: { value: "JEE" }
    });

    fireEvent.click(screen.getByLabelText("Start your MindBoard journey"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Please share your name so we can address you warmly."
      );
    });

    expect(saveOnboarding).not.toHaveBeenCalled();
  });

  it("shows validation error when exam is not selected on submit", async () => {
    render(<Onboarding {...defaultProps} />);

    // Fill name but leave exam empty
    fireEvent.change(screen.getByLabelText("Student name"), {
      target: { value: "Rahul" }
    });

    fireEvent.click(screen.getByLabelText("Start your MindBoard journey"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Please select the exam you are preparing for."
      );
    });

    expect(saveOnboarding).not.toHaveBeenCalled();
  });

  it("calls saveOnboarding and onComplete after successful submission", async () => {
    const onComplete = vi.fn();
    render(<Onboarding {...defaultProps} onComplete={onComplete} />);

    // Fill in name
    fireEvent.change(screen.getByLabelText("Student name"), {
      target: { value: "Rahul" }
    });

    // Select exam
    fireEvent.change(screen.getByLabelText("Target exam selection"), {
      target: { value: "JEE" }
    });

    // Submit the form
    fireEvent.click(screen.getByLabelText("Start your MindBoard journey"));

    await waitFor(() => {
      expect(saveOnboarding).toHaveBeenCalledWith(
        "test-user-id",
        expect.objectContaining({
          name: "Rahul",
          targetExam: "JEE"
        })
      );
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Rahul",
          targetExam: "JEE"
        })
      );
    });
  });

  it("disables inputs while submitting", async () => {
    // Make saveOnboarding hang so we can observe the submitting state
    saveOnboarding.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );

    render(<Onboarding {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Student name"), {
      target: { value: "Priya" }
    });
    fireEvent.change(screen.getByLabelText("Target exam selection"), {
      target: { value: "NEET" }
    });

    fireEvent.click(screen.getByLabelText("Start your MindBoard journey"));

    // While submitting, the button text changes and inputs become disabled
    await waitFor(() => {
      expect(screen.getByLabelText("Start your MindBoard journey")).toHaveTextContent("Setting up...");
      expect(screen.getByLabelText("Student name")).toBeDisabled();
      expect(screen.getByLabelText("Target exam selection")).toBeDisabled();
      expect(screen.getByLabelText("Target exam date")).toBeDisabled();
    });
  });

  it("shows error message when saveOnboarding fails", async () => {
    saveOnboarding.mockRejectedValueOnce(new Error("Network error"));

    render(<Onboarding {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("Student name"), {
      target: { value: "Rahul" }
    });
    fireEvent.change(screen.getByLabelText("Target exam selection"), {
      target: { value: "JEE" }
    });

    fireEvent.click(screen.getByLabelText("Start your MindBoard journey"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again."
      );
    });
  });
});
