import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FiveMinJournal from "./FiveMinJournal";
import { saveJournalEntry, getJournalEntries } from "../firebase";

// Mock the firebase functions
vi.mock("../firebase", () => ({
  saveJournalEntry: vi.fn(),
  getJournalEntries: vi.fn()
}));

describe("FiveMinJournal Component", () => {
  const mockUid = "test-user-uid";
  const mockEntries = [
    { id: "1", text: "Felt really productive today studying physics.", timestamp: "2026-06-06T10:00:00Z" }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    getJournalEntries.mockResolvedValue(mockEntries);
  });

  it("renders correctly with loading state and initial logs", async () => {
    render(<FiveMinJournal uid={mockUid} />);
    
    // Expect loading spinner
    expect(screen.getByLabelText("Loading past entries")).toBeInTheDocument();
    
    // Wait for mock data load
    await waitFor(() => {
      expect(screen.queryByLabelText("Loading past entries")).not.toBeInTheDocument();
    });

    expect(screen.getByText("5-Minute Brain Dump")).toBeInTheDocument();
    expect(screen.getByText("Felt really productive today studying physics.")).toBeInTheDocument();
  });

  it("allows typing and submitting a new journal entry", async () => {
    const newEntry = { id: "2", text: "Feeling nervous about JEE chemistry tomorrow.", timestamp: "2026-06-06T11:00:00Z" };
    saveJournalEntry.mockResolvedValue(newEntry);

    render(<FiveMinJournal uid={mockUid} />);

    await waitFor(() => {
      expect(screen.queryByLabelText("Loading past entries")).not.toBeInTheDocument();
    });

    const textarea = screen.getByLabelText("Private journal text editor");
    const saveBtn = screen.getByRole("button", { name: /Save journal entry/i });

    // Initial state: save button disabled if text is empty
    expect(saveBtn).toBeDisabled();

    // Type text
    fireEvent.change(textarea, { target: { value: "Feeling nervous about JEE chemistry tomorrow." } });
    expect(saveBtn).not.toBeDisabled();

    // Submit
    fireEvent.click(saveBtn);
    expect(saveBtn).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Journal saved privately.")).toBeInTheDocument();
    });

    // Check it gets added to list
    expect(screen.getByText("Feeling nervous about JEE chemistry tomorrow.")).toBeInTheDocument();
    expect(textarea.value).toBe(""); // Cleared
  });
});
