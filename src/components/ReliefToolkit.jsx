import React, { useState, useEffect, useRef } from "react";
import { saveJournalEntry, getJournalEntries } from "../firebase";

const quotes = [
  {
    text: "You cannot change your future, but you can change your habits, and surely your habits will change your future.",
    author: "Dr. A.P.J. Abdul Kalam",
    meta: "Aerospace Scientist & Former President of India"
  },
  {
    text: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda",
    meta: "Philosopher"
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius",
    meta: "Philosopher"
  },
  {
    text: "Rank is just a number in a database. Your curiosity, resilience, and compassion are what make you irreplaceable.",
    author: "MindBoard Mentor",
    meta: "JEE & UPSC Toppers Advice"
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas A. Edison",
    meta: "Inventor"
  },
  {
    text: "Study to understand, to build, to discover. Don't study just to clear a cutoff. The knowledge stays; the rank fades.",
    author: "Richard Feynman",
    meta: "Nobel Laureate in Physics"
  },
  {
    text: "Mock tests are mirrors to show your weak spots, not scales to weigh your intelligence.",
    author: "UPSC Topper (AIR 4)",
    meta: "Civil Services Aspirant Wisdom"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    meta: "Statesman"
  },
  {
    text: "Do not judge me by my successes, judge me by how many times I fell down and got back up again.",
    author: "Nelson Mandela",
    meta: "Philanthropist & Statesman"
  },
  {
    text: "It is okay to be scared. But it is not okay to let fear stop you from seeing what you are capable of.",
    author: "Board Exam Topper (98.5%)",
    meta: "Peer Encouragement"
  }
];

const journalPrompts = [
  "Write down everything you're worried about right now. Let it out on this page and leave it here.",
  "What are three small things you are grateful for today?",
  "Reflect on a concept or topic you struggled with, but finally understood recently. How did it feel?",
  "If your best friend was feeling this exam pressure, what comforting words would you tell them?",
  "Describe your ideal relaxing day after your exams are over."
];

export default function ReliefToolkit({ uid }) {
  const [activeTab, setActiveTab] = useState("breathing");

  // --- BREATHING EXERCISE STATE ---
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("hold-exhale"); // inhale, hold-inhale, exhale, hold-exhale
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);
  const [totalTimeLeft, setTotalTimeLeft] = useState(240); // 4 minutes
  const breathingTimerRef = useRef(null);

  // --- JOURNAL STATE ---
  const [journalText, setJournalText] = useState("");
  const [journalLogs, setJournalLogs] = useState([]);
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [journalStatus, setJournalStatus] = useState("");
  const [loadingJournals, setLoadingJournals] = useState(false);

  // --- QUOTES STATE ---
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  // Handle breathing logic
  useEffect(() => {
    if (isBreathingActive) {
      breathingTimerRef.current = setInterval(() => {
        // Decrease timers
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(breathingTimerRef.current);
            setIsBreathingActive(false);
            return 0;
          }
          return prev - 1;
        });

        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            // Cycle phases: inhale -> hold-inhale -> exhale -> hold-exhale -> inhale
            setBreathingPhase((prevPhase) => {
              switch (prevPhase) {
                case "hold-exhale":
                  return "inhale";
                case "inhale":
                  return "hold-inhale";
                case "hold-inhale":
                  return "exhale";
                case "exhale":
                  return "hold-exhale";
                default:
                  return "inhale";
              }
            });
            return 4; // Reset countdown for the next 4s phase
          }
          return prevPhaseTime - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    }

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [isBreathingActive]);

  // Reset breathing state
  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathingPhase("hold-exhale");
    setPhaseTimeLeft(4);
    setTotalTimeLeft(240);
  };

  const getPhaseText = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In";
      case "hold-inhale":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "hold-exhale":
        return "Hold & Relax";
      default:
        return "Get Ready";
    }
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Load journals on tab change ---
  useEffect(() => {
    if (activeTab === "journal") {
      loadJournals();
      // Pick a random prompt
      setCurrentPromptIdx(Math.floor(Math.random() * journalPrompts.length));
    }
  }, [activeTab, uid]);

  const loadJournals = async () => {
    setLoadingJournals(true);
    try {
      const logs = await getJournalEntries(uid);
      setJournalLogs(logs);
    } catch (err) {
      console.error("Failed to load journal logs:", err);
    } finally {
      setLoadingJournals(false);
    }
  };

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
      console.error("Save journal error:", err);
      setJournalStatus("Failed to save. Try again.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  // --- Quote refresh ---
  const handleRefreshQuote = () => {
    let nextQuote;
    do {
      nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (nextQuote.text === currentQuote.text);
    setCurrentQuote(nextQuote);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Tab Selectors */}
      <div className="toolkit-tabs" role="tablist" aria-label="Relief tools selection">
        <button
          className={`toolkit-tab-btn ${activeTab === "breathing" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("breathing");
            setJournalStatus("");
          }}
          role="tab"
          aria-selected={activeTab === "breathing"}
          aria-controls="breathing-panel"
          id="tab-breathing"
        >
          💨 Box Breathing
        </button>
        <button
          className={`toolkit-tab-btn ${activeTab === "journal" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("journal");
            resetBreathing();
          }}
          role="tab"
          aria-selected={activeTab === "journal"}
          aria-controls="journal-panel"
          id="tab-journal"
        >
          📝 5-Min Journal
        </button>
        <button
          className={`toolkit-tab-btn ${activeTab === "quotes" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("quotes");
            resetBreathing();
            setJournalStatus("");
          }}
          role="tab"
          aria-selected={activeTab === "quotes"}
          aria-controls="quotes-panel"
          id="tab-quotes"
        >
          ✨ Topper Quotes
        </button>
      </div>

      {/* --- PANEL 1: BOX BREATHING --- */}
      {activeTab === "breathing" && (
        <div 
          id="breathing-panel" 
          role="tabpanel" 
          aria-labelledby="tab-breathing"
          className="card"
        >
          <div className="breathing-wrapper">
            <div className="breathing-title-block">
              <h3>Box Breathing</h3>
              <p>Calm your nervous system in 4 minutes. Inhale, Hold, Exhale, Hold.</p>
            </div>

            <div className="breathing-visualizer">
              <div className="breathing-box" />
              <div className={`breathing-circle ${isBreathingActive ? breathingPhase : ""}`}>
                <span className="breathing-count" aria-live="polite">
                  {isBreathingActive ? phaseTimeLeft : "4"}
                </span>
              </div>
            </div>

            <div className="breathing-instruction">
              {isBreathingActive ? getPhaseText() : "Ready when you are"}
            </div>

            <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>
              Total Time: {formatTime(totalTimeLeft)}
            </div>

            <div className="breathing-controls">
              <button
                className="btn-primary"
                style={{ minWidth: "120px", height: "48px" }}
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                aria-label={isBreathingActive ? "Pause breathing exercise" : "Start box breathing"}
              >
                {isBreathingActive ? "Pause" : "Start"}
              </button>
              <button
                className="btn-secondary"
                onClick={resetBreathing}
                aria-label="Reset breathing exercise"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL 2: 5-MINUTE JOURNAL --- */}
      {activeTab === "journal" && (
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
            💡 <strong>Writing Prompt:</strong> {journalPrompts[currentPromptIdx]}
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
      )}

      {/* --- PANEL 3: MOTIVATIONAL QUOTES --- */}
      {activeTab === "quotes" && (
        <div 
          id="quotes-panel" 
          role="tabpanel" 
          aria-labelledby="tab-quotes"
          className="card"
        >
          <div className="quotes-wrapper">
            <h3>Daily Spark</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "-12px" }}>
              Perspective updates from those who walked the path.
            </p>

            <div className="quote-bubble">
              <p className="quote-text">{currentQuote.text}</p>
              <div className="quote-author">— {currentQuote.author}</div>
              <div className="quote-author-meta">{currentQuote.meta}</div>
            </div>

            <button
              className="refresh-quote-btn"
              onClick={handleRefreshQuote}
              aria-label="Get another motivational quote"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              Another Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
