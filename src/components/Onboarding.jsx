import { useState } from "react";
import PropTypes from "prop-types";
import { saveOnboarding } from "../firebase";
import { EXAMS_LIST } from "../constants";

export default function Onboarding({ uid, onComplete }) {
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please share your name so we can address you warmly.");
      return;
    }
    if (!targetExam) {
      setError("Please select the exam you are preparing for.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const onboardingData = {
        name: name.trim(),
        targetExam,
        examDate: examDate || null,
        onboardedAt: new Date().toISOString()
      };
      await saveOnboarding(uid, onboardingData);
      onComplete(onboardingData);
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="card onboarding-card">
        <div className="onboarding-intro">
          <div style={{ fontSize: "3rem", display: "inline-block" }}>🧠</div>
          <h1>Welcome to MindBoard</h1>
          <p>
            Your mental wellness companion built specifically to understand and 
            navigate the unique pressure of competitive exams in India.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="checkin-section" style={{ gap: "1.25rem" }}>
          <div className="form-group">
            <label htmlFor="student-name">What should we call you?</label>
            <input
              id="student-name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Student name"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="target-exam">Which exam are you preparing for?</label>
            <select
              id="target-exam"
              className="form-input"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              aria-label="Target exam selection"
              disabled={isSubmitting}
            >
              <option value="" disabled>Select your exam</option>
              {EXAMS_LIST.map((exam) => (
                <option key={exam.value} value={exam.value}>
                  {exam.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="exam-date">Target Exam Date (Optional)</label>
            <input
              id="exam-date"
              type="date"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              aria-label="Target exam date"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div role="alert" style={{ color: "var(--color-error)", fontSize: "0.9rem", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            aria-label="Start your MindBoard journey"
          >
            {isSubmitting ? "Setting up..." : "Begin Journey →"}
          </button>
        </form>
      </div>
    </div>
  );
}

Onboarding.propTypes = {
  uid: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired
};
