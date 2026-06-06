import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { saveJournalEntry, getJournalEntries } from "../firebase";
import { logError } from "../utils/logger";
import { JOURNAL_PROMPTS } from "../constants";

/**
 * FiveMinJournal component.
 * Allows students to type down their private thoughts to clear mental workspace.
 * 
 * @param {object} props The component props.
 * @param {string} props.uid The active user session ID.
 * @returns {React.ReactElement} The journaling interface.
 */
export default function FiveMinJournal({ uid }) {
  const [journalText, setJournalText] = useState("");
  const [journalLogs, setJournalLogs] = useState([]);
  const [currentPromptIdx] = useState(() => Math.floor(Math.random() * JOURNAL_PROMPTS.length));
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalStatus, setJournalStatus] = useState("");
  const [loadingJournals, setLoadingJournals] = useState(true);

  // Load journals on mount and set random writing prompt
  useEffect(() => {
    let active = true;
    getJournalEntries(uid)
      .then((logs) => {
        if (active) {
          setJournalLogs(logs);
        }
      })
      .catch((err) => {
        logError("Failed to load journal logs", err);
      })
      .finally(() => {
        if (active) {
          setLoadingJournals(false);
        }
      });

    return () => {
      active = false;
    };
  }, [uid]);

  /**
   * Submits a sanitized journal text entry to database.
   */
  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    setIsSavingJournal(true);
    setJournalStatus("");
    try {
      const newLog = await saveJournalEntry(uid, journalText.trim());
      setJournalLogs((prev) => [newLog, ...prev]);
      setJournalText("");
      setJournalStatus("Journal saved privately.");
      setTimeout(() => setJournalStatus(""), 4000);
    } catch (err) {
      logError("Save journal error", err);
      setJournalStatus("Failed to save. Try again.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  return (
    <div 
      id="journal-panel" 
      role="tabpanel" 
      aria-labelledby="tab-journal"
      className="card journal-wrapper"
    >
      <div className="journal-header-area">
        <h3>5-Minute Brain Dump</h3>
        <p>Write your thoughts to clear mental space. These logs are saved completely privately in your profile.</p>
      </div>

      <div className="nudge-bubble" style={{ borderStyle: "solid", fontSize: "0.9rem" }}>
        💡 <strong>Writing Prompt:</strong> {JOURNAL_PROMPTS[currentPromptIdx]}
      </div>

      <textarea
        className="journal-textarea"
        placeholder="Write whatever is on your mind... No filter, no judgment."
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        disabled={isSavingJournal}
        aria-label="Private journal text editor"
      />

      <div className="journal-meta-row">
        <span className="journal-status" role="status">
          {journalStatus}
        </span>
        <button
          className="btn-primary"
          style={{ width: "auto", minWidth: "120px", padding: "10px 20px" }}
          onClick={handleSaveJournal}
          disabled={isSavingJournal || !journalText.trim()}
          aria-label="Save journal entry"
        >
          {isSavingJournal ? "Saving..." : "Save Entry"}
        </button>
      </div>

      <div className="divider" />

      <h4>Past Entries</h4>
      {loadingJournals ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
          <div className="spinner" aria-label="Loading past entries" style={{ width: "24px", height: "24px" }} />
        </div>
      ) : journalLogs.length === 0 ? (
        <div className="journal-empty-history">
          No previous journals written. Log your first thoughts above to see history.
        </div>
      ) : (
        <div className="journal-history-list">
          {journalLogs.map((log) => {
            const date = new Date(log.timestamp);
            const localStr = date.toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });
            return (
              <div key={log.id} className="journal-history-card">
                <span className="journal-history-time">{localStr}</span>
                <p className="journal-history-text">{log.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

FiveMinJournal.propTypes = {
  uid: PropTypes.string.isRequired
};
