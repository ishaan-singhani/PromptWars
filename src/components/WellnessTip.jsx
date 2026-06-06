import React from "react";

export default function WellnessTip({ tip, isLoading, studentName, targetExam }) {
  if (isLoading) {
    return (
      <div className="card loading-tip">
        <div className="spinner" aria-label="Generating tip loading spinner" />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", fontStyle: "italic" }}>
          Talking to our AI topper friend to write a warm reframe just for you...
        </p>
      </div>
    );
  }

  if (!tip) return null;

  return (
    <div className="card tip-container">
      <div className="tip-header">
        <span role="img" aria-label="Supportive Lightbulb">💡</span> Warm Reframe For You
      </div>
      <blockquote className="tip-content">
        "{tip}"
      </blockquote>
      <div className="tip-footer">
        <span>— Your MindBoard Friend</span>
        <span>Rank ≠ Self Worth</span>
      </div>
      <div className="divider" style={{ margin: "12px 0 8px 0" }} />
      <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
        <strong>Reminder:</strong> Your preparation for {targetExam || "exams"} is just one part of your story, {studentName}. 
        No paper, score, or exam rank can ever measure your full capabilities or define your value.
      </p>
    </div>
  );
}
