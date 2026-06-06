import React from "react";
import PropTypes from "prop-types";

/**
 * EmptyState component.
 * Displays when dashboard history has no logged records.
 * 
 * @param {object} [props] The component props.
 * @param {string} [props.message] Optional override message text.
 * @returns {React.ReactElement} Empty dashboard placeholder display.
 */
const EmptyState = React.memo(function EmptyState({ message }) {
  return (
    <div className="card empty-dashboard-state">
      <div className="empty-dashboard-icon">🌱</div>
      <h2>Your MindBoard Dashboard is ready!</h2>
      <p style={{ maxWidth: "340px", fontSize: "0.95rem" }}>
        {message || "Once you complete your first daily check-in, your 7-day mood graph, common stress triggers, and custom study insights will show up here."}
      </p>
    </div>
  );
});

EmptyState.propTypes = {
  message: PropTypes.string
};

export default EmptyState;
