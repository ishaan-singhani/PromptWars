import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WellnessTip from "./WellnessTip";

describe("WellnessTip Component", () => {
  it("renders the loading spinner during generating phase", () => {
    render(<WellnessTip isLoading={true} tip="" />);
    expect(screen.getByLabelText("Generating tip loading spinner")).toBeInTheDocument();
    expect(screen.getByText(/talking to our AI topper friend/i)).toBeInTheDocument();
  });

  it("renders the tip content correctly when loaded", () => {
    const testTip = "Take a moment to step away from your desk and roll your shoulders.";
    render(
      <WellnessTip 
        isLoading={false} 
        tip={testTip} 
        studentName="Rahul" 
        targetExam="JEE" 
      />
    );
    expect(screen.getByText(`"${testTip}"`)).toBeInTheDocument();
    expect(screen.getByText(/your preparation for JEE is just one part of your story, Rahul/i)).toBeInTheDocument();
  });

  it("handles empty or null tip values gracefully by rendering nothing", () => {
    const { container } = render(<WellnessTip isLoading={false} tip="" />);
    expect(container.firstChild).toBeNull();
  });
});
