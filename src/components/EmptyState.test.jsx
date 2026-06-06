import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EmptyState from "./EmptyState";

describe("EmptyState Component", () => {
  it("renders without crashing", () => {
    render(<EmptyState />);
    expect(screen.getByText("Your MindBoard Dashboard is ready!")).toBeInTheDocument();
  });

  it("displays the correct message text", () => {
    render(<EmptyState />);
    expect(
      screen.getByText(/Once you complete your first daily check-in/)
    ).toBeInTheDocument();
  });

  it("displays the seed emoji icon", () => {
    render(<EmptyState />);
    expect(screen.getByText("🌱")).toBeInTheDocument();
  });

  it("has the correct CSS class", () => {
    const { container } = render(<EmptyState />);
    const wrapper = container.querySelector(".empty-dashboard-state");
    expect(wrapper).toBeInTheDocument();
  });
});
