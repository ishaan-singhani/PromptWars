import React from "react";
import PropTypes from "prop-types";
import ErrorBoundary from "./ErrorBoundary";

/**
 * LoadingScreen component to display authentication or loading spinner.
 * @returns {React.ReactElement} The loading screen.
 */
const LoadingScreen = React.memo(function LoadingScreen() {
  return (
    <ErrorBoundary>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-dark)",
        color: "var(--color-text-secondary)"
      }}>
        <div className="spinner" aria-label="Authenticating user" style={{ marginBottom: "1rem" }} />
        <p style={{ fontStyle: "italic" }}>MindBoard is opening doors...</p>
      </div>
    </ErrorBoundary>
  );
});

LoadingScreen.propTypes = {};

export default LoadingScreen;
