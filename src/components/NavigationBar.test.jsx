import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NavigationBar from "./NavigationBar";

describe("NavigationBar Component", () => {
  const defaultProps = {
    activeTab: "home",
    setActiveTab: vi.fn(),
    theme: "light",
    toggleTheme: vi.fn()
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 3 navigation tabs (home, insights, toolkit)", () => {
    render(<NavigationBar {...defaultProps} />);

    expect(screen.getByText("Daily Check-In")).toBeInTheDocument();
    expect(screen.getByText("My Insights")).toBeInTheDocument();
    expect(screen.getByText("Relief Toolkit")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<NavigationBar {...defaultProps} />);
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });

  it("calls setActiveTab with 'home' when Daily Check-In tab is clicked", () => {
    const setActiveTab = vi.fn();
    render(<NavigationBar {...defaultProps} setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByLabelText("Home page daily check-in tab"));
    expect(setActiveTab).toHaveBeenCalledWith("home");
  });

  it("calls setActiveTab with 'insights' when My Insights tab is clicked", () => {
    const setActiveTab = vi.fn();
    render(<NavigationBar {...defaultProps} setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByLabelText("Dashboard insights tab"));
    expect(setActiveTab).toHaveBeenCalledWith("insights");
  });

  it("calls setActiveTab with 'toolkit' when Relief Toolkit tab is clicked", () => {
    const setActiveTab = vi.fn();
    render(<NavigationBar {...defaultProps} setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByLabelText("Quick relief toolkit tab"));
    expect(setActiveTab).toHaveBeenCalledWith("toolkit");
  });

  it("applies 'active' class to the currently active home tab", () => {
    render(<NavigationBar {...defaultProps} activeTab="home" />);

    const homeBtn = screen.getByLabelText("Home page daily check-in tab");
    expect(homeBtn).toHaveClass("active");

    const insightsBtn = screen.getByLabelText("Dashboard insights tab");
    expect(insightsBtn).not.toHaveClass("active");

    const toolkitBtn = screen.getByLabelText("Quick relief toolkit tab");
    expect(toolkitBtn).not.toHaveClass("active");
  });

  it("applies 'active' class to the currently active insights tab", () => {
    render(<NavigationBar {...defaultProps} activeTab="insights" />);

    const insightsBtn = screen.getByLabelText("Dashboard insights tab");
    expect(insightsBtn).toHaveClass("active");

    const homeBtn = screen.getByLabelText("Home page daily check-in tab");
    expect(homeBtn).not.toHaveClass("active");
  });

  it("applies 'active' class to the currently active toolkit tab", () => {
    render(<NavigationBar {...defaultProps} activeTab="toolkit" />);

    const toolkitBtn = screen.getByLabelText("Quick relief toolkit tab");
    expect(toolkitBtn).toHaveClass("active");

    const homeBtn = screen.getByLabelText("Home page daily check-in tab");
    expect(homeBtn).not.toHaveClass("active");
  });

  it("sets aria-selected correctly for each tab", () => {
    render(<NavigationBar {...defaultProps} activeTab="insights" />);

    expect(screen.getByLabelText("Dashboard insights tab")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Home page daily check-in tab")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByLabelText("Quick relief toolkit tab")).toHaveAttribute("aria-selected", "false");
  });

  it("calls toggleTheme when theme button is clicked", () => {
    const toggleTheme = vi.fn();
    render(<NavigationBar {...defaultProps} toggleTheme={toggleTheme} />);

    fireEvent.click(screen.getByLabelText("Switch to dark theme"));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("shows sun emoji in dark mode and moon emoji in light mode", () => {
    const { rerender } = render(<NavigationBar {...defaultProps} theme="dark" />);
    expect(screen.getByText("☀️")).toBeInTheDocument();

    rerender(<NavigationBar {...defaultProps} theme="light" />);
    expect(screen.getByText("🌙")).toBeInTheDocument();
  });

  it("renders within a nav element with correct aria-label", () => {
    render(<NavigationBar {...defaultProps} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Primary navigation menu");
  });
});
