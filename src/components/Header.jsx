import PropTypes from "prop-types";

/**
 * Header component for MindBoard.
 * Displays application logo brand, theme toggle button, and active check-in streak count.
 * 
 * @param {object} props The component props.
 * @param {string} props.theme Current color theme ("light" | "dark").
 * @param {function} props.toggleTheme Function to toggle between themes.
 * @param {number} props.currentStreak Current check-in streak.
 * @returns {React.ReactElement} The rendered Header component.
 */
export default function Header({ theme, toggleTheme, currentStreak }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" aria-label="MindBoard Brand Logo">
          MindBoard <span>🧠</span>
        </div>
      </div>
      <div className="header-meta" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div 
          className="streak-badge" 
          aria-label={`Current check in streak: ${currentStreak || 0} days`}
        >
          🔥 {currentStreak || 0}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  currentStreak: PropTypes.number.isRequired
};
