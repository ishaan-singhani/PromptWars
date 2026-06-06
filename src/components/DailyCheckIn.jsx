import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { saveMoodCheckIn, getMoodHistory } from "../firebase";
import { generateWellnessTip } from "../gemini";
import MoodSelector from "./MoodSelector";
import TriggerSelector from "./TriggerSelector";
import LoggedStateCard from "./LoggedStateCard";

/**
 * Format today's date as a local YYYY-MM-DD string.
 * @returns {string} The formatted local date string.
 */
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * DailyCheckIn component.
 * Allows the student to select their current mood and primary stress trigger,
 * saving the check-in and retrieving personalized wellness/reframe advice.
 * 
 * @param {object} props The component props.
 * @param {string} props.uid Unique user session ID.
 * @param {object} props.studentInfo Profile details of the student.
 * @param {object} props.streakData Check-in streak tracking details.
 * @param {function} props.onCheckInComplete Callback when check-in is submitted.
 * @returns {React.ReactElement} Daily Check-In workspace panel.
 */
export default function DailyCheckIn({ uid, studentInfo, streakData, onCheckInComplete }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todaysEntry, setTodaysEntry] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  useEffect(() => {
    const checkTodayStatus = async () => {
      const todayStr = getTodayStr();
      if (streakData?.lastCheckInDate === todayStr) {
        setHasCheckedInToday(true);
        try {
          setIsLoadingTip(true);
          const history = await getMoodHistory(uid);
          const todayLog = history.find(e => new Date(e.timestamp).toISOString().split("T")[0] === todayStr);
          if (todayLog) {
            setTodaysEntry(todayLog);
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
      const result = await saveMoodCheckIn(uid, selectedMood, selectedTrigger);
      const tipText = await generateWellnessTip(studentInfo, selectedMood, selectedTrigger);
      setAiTip(tipText);
      setTodaysEntry({
        mood: selectedMood,
        trigger: selectedTrigger,
        timestamp: new Date().toISOString()
      });
      setHasCheckedInToday(true);

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
    return (
      <LoggedStateCard
        todaysEntry={todaysEntry}
        aiTip={aiTip}
        isLoadingTip={isLoadingTip}
        studentInfo={studentInfo}
      />
    );
  }

  return (
    <div className="checkin-section">
      <div className="card">
        <h2 className="checkin-title">How are you feeling today, {studentInfo?.name}?</h2>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Be honest with yourself. There are no wrong answers here.
        </p>

        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={(m) => {
            setSelectedMood(m);
            setError("");
          }}
          disabled={isSubmitting}
        />

        <div className={`followup-container ${selectedMood ? "expanded" : ""}`}>
          <div className="divider" />
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            What's affecting you most today?
          </h3>
          <TriggerSelector
            selectedTrigger={selectedTrigger}
            onSelectTrigger={(t) => {
              setSelectedTrigger(t);
              setError("");
            }}
            disabled={isSubmitting}
          />
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
              aria-label="Submit Check-In & Get AI Tip"
            >
              {isSubmitting ? "Saving entry..." : "Submit Check-In & Get AI Tip"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

DailyCheckIn.propTypes = {
  uid: PropTypes.string.isRequired,
  studentInfo: PropTypes.shape({
    name: PropTypes.string,
    targetExam: PropTypes.string
  }).isRequired,
  streakData: PropTypes.shape({
    currentStreak: PropTypes.number,
    lastCheckInDate: PropTypes.string
  }).isRequired,
  onCheckInComplete: PropTypes.func.isRequired
};
