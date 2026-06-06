import PropTypes from "prop-types";

/**
 * DailyNudgeBanner component.
 * Displays a dismissible top banner reminding the student to complete their daily mood log check-in.
 * 
 * @param {object} props The component props.
 * @param {string} props.studentName The name of the onboarding student.
 * @param {function} props.onLogMoodClick Callback to trigger when the user chooses to log their mood.
 * @param {function} props.onDismiss Callback when the banner is closed.
 * @returns {React.ReactElement} The nudge banner layout.
 */
export default function DailyNudgeBanner({ studentName, onLogMoodClick, onDismiss }) {
  return (
    <div className="notification-banner" role="status" aria-live="polite">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "1.2rem" }}>👋</span>
        <p>
          Hey <span>{studentName}</span>, how are you holding up today? Take a second to check in.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button 
          className="btn-primary" 
          style={{ width: "auto", minWidth: "80px", padding: "6px 12px", fontSize: "0.8rem", minHeight: "34px" }}
          onClick={onLogMoodClick}
          aria-label="Navigate to home check in"
        >
          Log Mood
        </button>
        <button 
          className="btn-banner-close"
          onClick={onDismiss}
          aria-label="Dismiss check-in reminder nudge"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

DailyNudgeBanner.propTypes = {
  studentName: PropTypes.string.isRequired,
  onLogMoodClick: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired
};
