import { memo } from "react";
import PropTypes from "prop-types";
import { MOODS_LIST } from "../constants";

/**
 * MoodSelector component.
 * Renders a selection group of mood emoji buttons for daily check-in.
 * 
 * @param {object} props The component props.
 * @param {string} [props.selectedMood] The currently selected mood value.
 * @param {function} props.onSelectMood Callback when a mood is selected.
 * @param {boolean} [props.isSubmitting] True if check-in is in progress.
 * @returns {React.ReactElement} MoodSelector component.
 */
const MoodSelector = memo(function MoodSelector({ selectedMood, onSelectMood, isSubmitting }) {
  return (
    <div className="mood-selector" role="radiogroup" aria-label="Daily mood selector">
      {MOODS_LIST.map((m) => (
        <button
          key={m.value}
          className={`mood-btn ${selectedMood === m.value ? "selected" : ""}`}
          onClick={() => onSelectMood(m.value)}
          role="radio"
          aria-checked={selectedMood === m.value}
          aria-label={`Feel ${m.label}`}
          disabled={isSubmitting}
          type="button"
        >
          <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
          <span className="mood-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
});

MoodSelector.propTypes = {
  selectedMood: PropTypes.string,
  onSelectMood: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

MoodSelector.defaultProps = {
  selectedMood: null,
  isSubmitting: false
};

export default MoodSelector;
