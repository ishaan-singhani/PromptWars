import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * BoxBreathing component.
 * Encapsulates state and UI for the 4-minute box breathing meditation exercise.
 * 
 * @returns {React.ReactElement} The box breathing user interface.
 */
export default function BoxBreathing() {
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("hold-exhale"); // inhale, hold-inhale, exhale, hold-exhale
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);
  const [totalTimeLeft, setTotalTimeLeft] = useState(240); // 4 minutes
  const breathingTimerRef = useRef(null);

  // Handle breathing logic
  useEffect(() => {
    if (isBreathingActive) {
      breathingTimerRef.current = setInterval(() => {
        // Decrease timers
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(breathingTimerRef.current);
            setIsBreathingActive(false);
            return 0;
          }
          return prev - 1;
        });

        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            // Cycle phases: inhale -> hold-inhale -> exhale -> hold-exhale -> inhale
            setBreathingPhase((prevPhase) => {
              switch (prevPhase) {
                case "hold-exhale":
                  return "inhale";
                case "inhale":
                  return "hold-inhale";
                case "hold-inhale":
                  return "exhale";
                case "exhale":
                  return "hold-exhale";
                default:
                  return "inhale";
              }
            });
            return 4; // Reset countdown for the next 4s phase
          }
          return prevPhaseTime - 1;
        });
      }, 1000);
    } else {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    }

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [isBreathingActive]);

  /**
   * Resets all parameters to starting state.
   */
  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathingPhase("hold-exhale");
    setPhaseTimeLeft(4);
    setTotalTimeLeft(240);
  };

  /**
   * Computes the display instruction text matching the active phase.
   * @returns {string} Empathic instruction.
   */
  const getPhaseText = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In";
      case "hold-inhale":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "hold-exhale":
        return "Hold & Relax";
      default:
        return "Get Ready";
    }
  };

  /**
   * Formats seconds into MM:SS format.
   * @param {number} seconds - Total number of seconds.
   * @returns {string} Formatted string.
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      id="breathing-panel" 
      role="tabpanel" 
      aria-labelledby="tab-breathing"
      className="card"
    >
      <div className="breathing-wrapper">
        <div className="breathing-title-block">
          <h3>Box Breathing</h3>
          <p>Calm your nervous system in 4 minutes. Inhale, Hold, Exhale, Hold.</p>
        </div>

        <div className="breathing-visualizer">
          <div className="breathing-box" />
          <div className={`breathing-circle ${isBreathingActive ? breathingPhase : ""}`}>
            <span className="breathing-count" aria-live="polite">
              {isBreathingActive ? phaseTimeLeft : "4"}
            </span>
          </div>
        </div>

        <div className="breathing-instruction">
          {isBreathingActive ? getPhaseText() : "Ready when you are"}
        </div>

        <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>
          Total Time: {formatTime(totalTimeLeft)}
        </div>

        <div className="breathing-controls">
          <button
            className="btn-primary"
            style={{ minWidth: "120px", height: "48px" }}
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            aria-label={isBreathingActive ? "Pause breathing exercise" : "Start box breathing"}
          >
            {isBreathingActive ? "Pause" : "Start"}
          </button>
          <button
            className="btn-secondary"
            onClick={resetBreathing}
            aria-label="Reset breathing exercise"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

BoxBreathing.propTypes = {};
