import PropTypes from "prop-types";

/**
 * InsightCard component.
 * Displays tailored study/wellness encouragement based on mood logging trends.
 * 
 * @param {object} props The component props.
 * @param {object} props.insight Insight object with fields { title, text }.
 * @returns {React.ReactElement|null} Card showing personalized reframe advice.
 */
export default function InsightCard({ insight }) {
  if (!insight) return null;

  return (
    <div className="card insight-card">
      <h3 style={{ color: "var(--color-mint)" }}>🎯 {insight.title}</h3>
      <p className="insight-text">{insight.text}</p>
    </div>
  );
}

InsightCard.propTypes = {
  insight: PropTypes.shape({
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })
};
