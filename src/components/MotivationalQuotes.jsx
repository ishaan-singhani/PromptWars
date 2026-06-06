import { useState } from "react";
import { MOTIVATIONAL_QUOTES } from "../constants";

/**
 * MotivationalQuotes component.
 * Displays quotes from toppers and scientists to inspire and ground the student.
 * 
 * @returns {React.ReactElement} Quotes dashboard segment.
 */
export default function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  /**
   * Refreshes the display quote randomly without repeating the current quote.
   */
  const handleRefreshQuote = () => {
    let nextQuote;
    do {
      nextQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    } while (nextQuote.text === currentQuote.text);
    setCurrentQuote(nextQuote);
  };

  return (
    <div 
      id="quotes-panel" 
      role="tabpanel" 
      aria-labelledby="tab-quotes"
      className="card"
    >
      <div className="quotes-wrapper">
        <h3>Daily Spark</h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginTop: "-12px" }}>
          Perspective updates from those who walked the path.
        </p>

        <div className="quote-bubble">
          <p className="quote-text">{currentQuote.text}</p>
          <div className="quote-author">— {currentQuote.author}</div>
          <div className="quote-author-meta">{currentQuote.meta}</div>
        </div>

        <button
          className="refresh-quote-btn"
          onClick={handleRefreshQuote}
          aria-label="Get another motivational quote"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Another Quote
        </button>
      </div>
    </div>
  );
}
