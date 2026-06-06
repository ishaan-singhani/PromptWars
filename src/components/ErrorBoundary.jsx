import { Component } from "react";
import PropTypes from "prop-types";
import { logError } from "../utils/logger";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError("ErrorBoundary caught an uncaught error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-dark, #070B19)",
          color: "var(--color-text-primary, #FFFFFF)",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-body, sans-serif)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🧠</div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Something went sideways...</h1>
          <p style={{
            color: "var(--color-text-secondary, #C3CFD9)",
            maxWidth: "400px",
            lineHeight: "1.5",
            marginBottom: "1.5rem"
          }}>
            Don't worry, your progress is saved. Try refreshing the page, or return to home.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "linear-gradient(135deg, var(--color-mint, #6FFFE9) 0%, var(--color-mint-hover, #5BC0BE) 100%)",
              color: "var(--bg-dark, #070B19)",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Refresh MindBoard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};
