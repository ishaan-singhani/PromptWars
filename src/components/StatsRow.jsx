import PropTypes from "prop-types";

/**
 * StatsRow component.
 * Displays horizontal dashboard metrics (streak and top stressor).
 * 
 * @param {object} props The component props.
 * @param {number} props.currentStreak Active daily check-in streak count.
 * @param {string|null} props.topTrigger The most frequent stress trigger logged.
 * @returns {React.ReactElement} Metric widgets container.
 */
export default function StatsRow({ currentStreak, topTrigger }) {
  return (
    <div className="dash-stats-row">
      <div className="stat-card">
        <span className="stat-val">🔥 {currentStreak || 0}</span>
        <span className="stat-label">Daily Streak</span>
      </div>
      <div className="stat-card">
        <span className="stat-val" style={{ fontSize: "1.2rem", height: "43px", display: "flex", alignItems: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
          {topTrigger ? topTrigger : "None logged"}
        </span>
        <span className="stat-label">Top Stressor</span>
      </div>
    </div>
  );
}

StatsRow.propTypes = {
  currentStreak: PropTypes.number,
  topTrigger: PropTypes.string
};
