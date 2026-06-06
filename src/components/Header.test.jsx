import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Header from "./Header";

describe("Header Component", () => {
  const defaultProps = {
    theme: "dark",
    toggleTheme: vi.fn(),
    currentStreak: 5
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app title 'MindBoard'", () => {
    render(<Header {...defaultProps} />);
    const brand = screen.getByLabelText("MindBoard Brand Logo");
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveTextContent("MindBoard");
  });

  it("renders the streak count correctly", () => {
    render(<Header {...defaultProps} currentStreak={7} />);
    const badge = screen.getByLabelText("Current check in streak: 7 days");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("🔥 7");
  });

  it("renders streak as 0 when currentStreak is 0", () => {
    render(<Header {...defaultProps} currentStreak={0} />);
    const badge = screen.getByLabelText("Current check in streak: 0 days");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("🔥 0");
  });

  it("has a theme toggle button with correct aria-label in dark mode", () => {
    render(<Header {...defaultProps} theme="dark" />);
    const toggleBtn = screen.getByLabelText("Switch to light mode");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("has a theme toggle button with correct aria-label in light mode", () => {
    render(<Header {...defaultProps} theme="light" />);
    const toggleBtn = screen.getByLabelText("Switch to dark mode");
    expect(toggleBtn).toBeInTheDocument();
  });

  it("calls toggleTheme when theme toggle button is clicked", () => {
    const toggleTheme = vi.fn();
    render(<Header {...defaultProps} toggleTheme={toggleTheme} />);

    const toggleBtn = screen.getByLabelText("Switch to light mode");
    fireEvent.click(toggleBtn);
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("shows sun emoji in dark mode and moon emoji in light mode", () => {
    const { rerender } = render(<Header {...defaultProps} theme="dark" />);
    expect(screen.getByText("☀️")).toBeInTheDocument();

    rerender(<Header {...defaultProps} theme="light" />);
    expect(screen.getByText("🌙")).toBeInTheDocument();
  });

  it("renders a header element", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
