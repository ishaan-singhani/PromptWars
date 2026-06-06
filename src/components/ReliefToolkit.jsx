import { useState } from "react";
import PropTypes from "prop-types";
import BoxBreathing from "./BoxBreathing";
import FiveMinJournal from "./FiveMinJournal";
import MotivationalQuotes from "./MotivationalQuotes";

/**
 * ReliefToolkit component.
 * Layout containing the navigation tabs and display panel for the three student relief utilities:
 * Box Breathing, 5-Minute Brain Dump journaling, and topper motivational quotes.
 * 
 * @param {object} props The component props.
 * @param {string} props.uid Unique user session ID.
 * @returns {React.ReactElement} Tabbed relief workspace panel.
 */
export default function ReliefToolkit({ uid }) {
  const [activeTab, setActiveTab] = useState("breathing");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Tab Selectors */}
      <div className="toolkit-tabs" role="tablist" aria-label="Relief tools selection">
        <button
          className={`toolkit-tab-btn ${activeTab === "breathing" ? "active" : ""}`}
          onClick={() => setActiveTab("breathing")}
          role="tab"
          aria-selected={activeTab === "breathing"}
          aria-controls="breathing-panel"
          id="tab-breathing"
        >
          💨 Box Breathing
        </button>
        <button
          className={`toolkit-tab-btn ${activeTab === "journal" ? "active" : ""}`}
          onClick={() => setActiveTab("journal")}
          role="tab"
          aria-selected={activeTab === "journal"}
          aria-controls="journal-panel"
          id="tab-journal"
        >
          📝 5-Min Journal
        </button>
        <button
          className={`toolkit-tab-btn ${activeTab === "quotes" ? "active" : ""}`}
          onClick={() => setActiveTab("quotes")}
          role="tab"
          aria-selected={activeTab === "quotes"}
          aria-controls="quotes-panel"
          id="tab-quotes"
        >
          ✨ Topper Quotes
        </button>
      </div>

      {/* Render selected relief panel */}
      {activeTab === "breathing" && <BoxBreathing />}
      {activeTab === "journal" && <FiveMinJournal uid={uid} />}
      {activeTab === "quotes" && <MotivationalQuotes />}
    </div>
  );
}

ReliefToolkit.propTypes = {
  uid: PropTypes.string.isRequired
};
