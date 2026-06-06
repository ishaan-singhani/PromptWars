import { memo } from "react";
import PropTypes from "prop-types";
import { TRIGGERS_LIST } from "../constants";

/**
 * TriggerSelector component.
 * Renders a grid of stress triggers for daily check-in selection.
 * 
 * @param {object} props The component props.
 * @param {string} [props.selectedTrigger] The currently selected trigger value.
 * @param {function} props.onSelectTrigger Callback when a trigger is selected.
 * @param {boolean} [props.isSubmitting] True if check-in submission is active.
 * @returns {React.ReactElement} TriggerSelector component.
 */
const TriggerSelector = memo(function TriggerSelector({ selectedTrigger, onSelectTrigger, isSubmitting }) {
  return (
    <div className="trigger-grid" role="group" aria-label="Stress triggers selection">
      {TRIGGERS_LIST.map((t) => (
        <button
          key={t}
          className={`trigger-btn ${selectedTrigger === t ? "selected" : ""}`}
          onClick={() => onSelectTrigger(t)}
          aria-label={`Trigger: ${t}`}
          disabled={isSubmitting}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  );
});

TriggerSelector.propTypes = {
  selectedTrigger: PropTypes.string,
  onSelectTrigger: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

TriggerSelector.defaultProps = {
  selectedTrigger: null,
  isSubmitting: false
};

export default TriggerSelector;
