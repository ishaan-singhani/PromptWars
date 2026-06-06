import PropTypes from "prop-types";
import { MOODS_LIST } from "../constants";
import WellnessTip from "./WellnessTip";

/**
 * LoggedStateCard component.
 * Displays the daily check-in confirmation view along with the generated AI reframe tip.
 * 
 * @param {object} props The component props.
 * @param {object} props.todaysEntry Today's saved mood log entry { mood, trigger }.
 * @param {string} props.aiTip The AI-generated wellness tip text.
 * @param {boolean} props.isLoadingTip True if the AI tip generation is loading.
 * @param {object} props.studentInfo Profile details of the student.
 * @returns {React.ReactElement} Checked-in dashboard segment.
 */
export default function LoggedStateCard({ todaysEntry, aiTip, isLoadingTip, studentInfo }) {
  const activeMood = MOODS_LIST.find(m => m.value === todaysEntry?.mood);

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

LoggedStateCard.propTypes = {
  todaysEntry: PropTypes.shape({
    mood: PropTypes.string.isRequired,
    trigger: PropTypes.string.isRequired,
    timestamp: PropTypes.string
  }),
  aiTip: PropTypes.string,
  isLoadingTip: PropTypes.bool.isRequired,
  studentInfo: PropTypes.shape({
    name: PropTypes.string,
    targetExam: PropTypes.string
  })
};
