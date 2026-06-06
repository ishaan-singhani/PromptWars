import PropTypes from "prop-types";

/**
 * NavigationBar component.
 * Bottom tab bar navigation for mobile devices, or left sidebar navigation on desktop layouts.
 * 
 * @param {object} props The component props.
 * @param {string} props.activeTab Currently selected tab ("home" | "insights" | "toolkit").
 * @param {function} props.setActiveTab Callback function to update selected active tab state.
 * @param {string} props.theme Current color theme mode ("light" | "dark").
 * @param {function} props.toggleTheme Callback function to switch theme setting.
 * @returns {React.ReactElement} The Navigation menu.
 */
export default function NavigationBar({ activeTab, setActiveTab, theme, toggleTheme }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation menu">
      <div className="nav-tabs-list" role="tablist" aria-label="App navigation tabs">
        <button
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
          role="tab"
          aria-selected={activeTab === "home"}
          aria-label="Home page daily check-in tab"
          type="button"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Daily Check-In</span>
        </button>

        <button
          className={`nav-item ${activeTab === "insights" ? "active" : ""}`}
          onClick={() => setActiveTab("insights")}
          role="tab"
          aria-selected={activeTab === "insights"}
          aria-label="Dashboard insights tab"
          type="button"
        >
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>My Insights</span>
        </button>

        <button
          className={`nav-item ${activeTab === "toolkit" ? "active" : ""}`}
          onClick={() => setActiveTab("toolkit")}
          role="tab"
          aria-selected={activeTab === "toolkit"}
          aria-label="Quick relief toolkit tab"
          type="button"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Relief Toolkit</span>
        </button>
      </div>

      {/* Theme Toggler Button */}
      <button
        className="nav-item theme-nav-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        type="button"
      >
        <span style={{ fontSize: "1.2rem", height: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {theme === "dark" ? "☀️" : "🌙"}
        </span>
        <span>Theme</span>
      </button>
    </nav>
  );
}

NavigationBar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired
};
