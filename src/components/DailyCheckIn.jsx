import React, { useState, useEffect } from "react";
import { saveMoodCheckIn, getMoodHistory } from "../firebase";
import { generateWellnessTip } from "../gemini";
import WellnessTip from "./WellnessTip";

export default function DailyCheckIn({ uid, studentInfo, streakData, onCheckInComplete }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todaysEntry, setTodaysEntry] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const moods = [
    { value: "Energized", emoji: "😄", label: "Energized" },
    { value: "Okay", emoji: "🙂", label: "Okay" },
    { value: "Tired", emoji: "😐", label: "Tired" },
    { value: "Anxious", emoji: "😟", label: "Anxious" },
    { value: "Burnt Out", emoji: "😔", label: "Burnt Out" }
  ];

  const triggers = [
    "Study Load",
    "Self-Doubt",
    "Family Pressure",
    "Fear of Failure",
    "Sleep Issues",
    "Comparison with Others",
    "Physical Health"
  ];

  // Format date helper to check YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Check if the user has checked in today based on streak or checking today's entries
    const checkTodayStatus = async () => {
      const todayStr = getTodayStr();
      if (streakData?.lastCheckInDate === todayStr) {
        setHasCheckedInToday(true);
        // Fetch history to extract today's mood and trigger
        try {
          setIsLoadingTip(true);
          const history = await getMoodHistory(uid);
          const todayLog = history.find(entry => {
            const entryDate = new Date(entry.timestamp);
            const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;
            return entryDateStr === todayStr;
          });

          if (todayLog) {
            setTodaysEntry(todayLog);
            // Re-generate or fetch the tip based on today's logged mood/trigger
            const tip = await generateWellnessTip(studentInfo, todayLog.mood, todayLog.trigger);
            setAiTip(tip);
          }
        } catch (err) {
          console.error("Failed to load today's check-in details:", err);
        } finally {
          setIsLoadingTip(false);
        }
      } else {
        setHasCheckedInToday(false);
        setTodaysEntry(null);
        setAiTip("");
      }
    };

    checkTodayStatus();
  }, [uid, streakData, studentInfo]);

  const handleSubmit = async () => {
    if (!selectedMood) {
      setError("Please select a mood first.");
      return;
    }
    if (!selectedTrigger) {
      setError("Please select what is affecting you most.");
      return;
    }

    setIsSubmitting(true);
    setIsLoadingTip(true);
    setError("");

    try {
      // 1. Save to Database
      const result = await saveMoodCheckIn(uid, selectedMood, selectedTrigger);
      
      // 2. Fetch AI tip
      const tipText = await generateWellnessTip(studentInfo, selectedMood, selectedTrigger);
      setAiTip(tipText);
      setTodaysEntry({
        mood: selectedMood,
        trigger: selectedTrigger,
        timestamp: new Date().toISOString()
      });
      setHasCheckedInToday(true);

      // 3. Trigger parent callbacks to refresh streak and history
      if (onCheckInComplete) {
        onCheckInComplete(result.streak);
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Failed to submit check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoadingTip(false);
    }
  };

  if (hasCheckedInToday) {
    const activeMood = moods.find(m => m.value === todaysEntry?.mood);
    return (
      <div className="checkin-section">
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
          <h2>Check-In Logged!</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            You logged your mood for today. Great job showing up for yourself.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "10px 0" }}>
            <div className="mood-btn selected" style={{ cursor: "default", flex: "none", minWidth: "120px" }}>
              <span className="mood-emoji">{activeMood?.emoji || "🙂"}</span>
              <span className="mood-label">{activeMood?.label || todaysEntry?.mood}</span>
            </div>
          </div>
          <div className="nudge-bubble" style={{ justifyContent: "center", borderStyle: "solid" }}>
            🎯 Affected by: <strong>{todaysEntry?.trigger}</strong>
          </div>
        </div>

        <WellnessTip 
          tip={aiTip} 
          isLoading={isLoadingTip} 
          studentName={studentInfo?.name}
          targetExam={studentInfo?.targetExam}
        />
      </div>
    );
  }

  return (
    <div className="checkin-section">
      <div className="card">
        <h2 className="checkin-title">How are you feeling today, {studentInfo?.name}?</h2>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Be honest with yourself. There are no wrong answers here.
        </p>

        <div className="mood-selector" role="radiogroup" aria-label="Daily mood selector">
          {moods.map((m) => (
            <button
              key={m.value}
              className={`mood-btn ${selectedMood === m.value ? "selected" : ""}`}
              onClick={() => {
                setSelectedMood(m.value);
                setError("");
              }}
              role="radio"
              aria-checked={selectedMood === m.value}
              aria-label={`Feel ${m.label}`}
              disabled={isSubmitting}
            >
              <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className={`followup-container ${selectedMood ? "expanded" : ""}`}>
          <div className="divider" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            What's affecting you most today?
          </h3>
          <div className="trigger-grid" role="group" aria-label="Stress triggers selection">
            {triggers.map((t) => (
              <button
                key={t}
                className={`trigger-btn ${selectedTrigger === t ? "selected" : ""}`}
                onClick={() => {
                  setSelectedTrigger(t);
                  setError("");
                }}
                aria-label={`Trigger: ${t}`}
                disabled={isSubmitting}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {selectedMood && selectedTrigger && (
          <div style={{ marginTop: "1.5rem" }}>
            {error && (
              <div role="alert" style={{ color: "var(--color-error)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "10px" }}>
                ⚠️ {error}
              </div>
            )}
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-label="Submit check in"
            >
              {isSubmitting ? "Saving entry..." : "Submit Check-In & Get AI Tip"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
