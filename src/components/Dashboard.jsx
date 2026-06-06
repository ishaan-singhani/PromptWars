import React, { useState, useEffect } from "react";
import { getMoodHistory } from "../firebase";

export default function Dashboard({ uid, studentInfo }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getMoodHistory(uid);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load mood history:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [uid]);

  // Mood numeric mapping
  const moodValues = {
    "Energized": 5,
    "Okay": 4,
    "Tired": 3,
    "Anxious": 2,
    "Burnt Out": 1
  };

  const moodEmojis = {
    5: "😄",
    4: "🙂",
    3: "😐",
    2: "😟",
    1: "😔"
  };

  // 1. Process last 7 days data
  const processSevenDaysData = () => {
    const days = [];
    const today = new Date();
    
    // Create list of last 7 calendar days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ label, dateStr, value: null, emoji: null, trigger: null });
    }

    // Map history entries to the matching day
    history.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;
      
      const match = days.find(day => day.dateStr === entryDateStr);
      if (match) {
        match.value = moodValues[entry.mood] || null;
        match.emoji = moodEmojis[match.value];
        match.trigger = entry.trigger;
      }
    });

    return days;
  };

  const lastSevenDays = processSevenDaysData();
  const checkedInDays = lastSevenDays.filter(d => d.value !== null);

  // 2. Find most common stress trigger this week
  const getMostCommonTrigger = () => {
    const counts = {};
    history.forEach(entry => {
      if (entry.trigger) {
        counts[entry.trigger] = (counts[entry.trigger] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mainTrigger = "";
    Object.keys(counts).forEach(trigger => {
      if (counts[trigger] > maxCount) {
        maxCount = counts[trigger];
        mainTrigger = trigger;
      }
    });

    return { trigger: mainTrigger, count: maxCount };
  };

  const topTrigger = getMostCommonTrigger();

  // 3. Compute personalized textual insights
  const generateInsights = () => {
    if (checkedInDays.length === 0) return null;

    const anxiousCount = history.filter(h => h.mood === "Anxious").length;
    const burntOutCount = history.filter(h => h.mood === "Burnt Out").length;
    const tiredCount = history.filter(h => h.mood === "Tired").length;

    if (anxiousCount >= 3) {
      return {
        title: "Nervous System Check-In",
        text: `You have felt anxious for ${anxiousCount} days in your recent logs. Preparing for ${studentInfo?.targetExam} is intensely demanding. When anxiety takes over, study capacity drops. We highly recommend using the Guided Box Breathing in the Relief Toolkit for 4 minutes before starting your study sessions to soothe your nerves. You're doing your best!`
      };
    }

    if (burntOutCount >= 2) {
      return {
        title: "Time to Recharge",
        text: `You logged feeling burnt out ${burntOutCount} times recently. Burnout is a serious message from your body. Rest is not laziness — it's restoration. Close your study material for the rest of today, sleep early, or write out your thoughts in the 5-Minute Journal. You cannot study effectively when running on empty.`
      };
    }

    if (tiredCount >= 3) {
      return {
        title: "Energy & Sleep Focus",
        text: `You have logged 'Tired' ${tiredCount} times. Sleep deprivation destroys memory retention. Instead of pushing through midnight revision blocks, consider prioritizing a solid 7-hour sleep cycle. A rested brain works twice as fast on exam practice questions.`
      };
    }

    if (topTrigger.trigger) {
      return {
        title: "Stress Focus: " + topTrigger.trigger,
        text: `It looks like "${topTrigger.trigger}" is affecting your mood most frequently this week. This is extremely common for students preparing for ${studentInfo?.targetExam}. Try breaking down your study goals into smaller daily targets. You don't have to carry the whole load at once.`
      };
    }

    return {
      title: "Keep Up the Tracking!",
      text: "You're building a consistent habit of checking in with yourself. Acknowledging your emotions helps you stay grounded amidst exam preparation pressure. Keep tracking, and remember your worth is separate from any test rank."
    };
  };

  const insight = generateInsights();

  // 4. Render Custom SVG Line Chart
  const renderSVGChart = () => {
    // Chart geometry variables
    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    // Days are spaced along the width
    const points = lastSevenDays.map((day, idx) => {
      const x = paddingLeft + (idx * (graphWidth / 6));
      // Mood values range 1-5. Value 5 maps to top (y=paddingTop), Value 1 maps to bottom (y=paddingTop+graphHeight)
      let y = null;
      if (day.value !== null) {
        y = paddingTop + graphHeight - ((day.value - 1) * (graphHeight / 4));
      }
      return { ...day, x, y };
    });

    // Generate SVG path coordinate line
    const activePoints = points.filter(p => p.y !== null);
    let linePath = "";
    let areaPath = "";

    if (activePoints.length > 0) {
      linePath = `M ${activePoints[0].x} ${activePoints[0].y}`;
      for (let i = 1; i < activePoints.length; i++) {
        linePath += ` L ${activePoints[i].x} ${activePoints[i].y}`;
      }

      // To fill the area chart
      const startX = activePoints[0].x;
      const endX = activePoints[activePoints.length - 1].x;
      const baselineY = paddingTop + graphHeight;
      areaPath = `${linePath} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
    }

    // Y Axis levels
    const yLevels = [5, 4, 3, 2, 1].map(val => {
      const y = paddingTop + graphHeight - ((val - 1) * (graphHeight / 4));
      return { val, y, label: moodEmojis[val] || val };
    });

    return (
      <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`} aria-label="7-day mood history trend line chart">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mint)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-mint)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLevels.map(lvl => (
          <g key={lvl.val}>
            <line
              className="chart-grid-line"
              x1={paddingLeft}
              y1={lvl.y}
              x2={width - paddingRight}
              y2={lvl.y}
            />
            <text
              className="chart-label-y"
              x={paddingLeft - 8}
              y={lvl.y + 3}
            >
              {lvl.label}
            </text>
          </g>
        ))}

        {/* Baseline Axis */}
        <line
          className="chart-axis-line"
          x1={paddingLeft}
          y1={paddingTop + graphHeight}
          x2={width - paddingRight}
          y2={paddingTop + graphHeight}
        />

        {/* Area fill */}
        {areaPath && <path className="chart-area" d={areaPath} />}

        {/* Trend line */}
        {linePath && <path className="chart-line" d={linePath} />}

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            {pt.y !== null && (
              <>
                <circle
                  className="chart-point"
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  aria-label={`${pt.label} mood was ${pt.value}`}
                />
                {/* Tooltip trigger or label above */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  fontSize="8"
                  fill="var(--color-mint)"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {pt.emoji}
                </text>
              </>
            )}
            {/* X Axis Labels */}
            <text
              className="chart-label-x"
              x={pt.x}
              y={height - 8}
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card" style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div className="spinner" aria-label="Loading dashboard analytics" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="card empty-dashboard-state">
        <div className="empty-dashboard-icon">🌱</div>
        <h2>Your MindBoard Dashboard is ready!</h2>
        <p style={{ maxWidth: "340px", fontSize: "0.95rem" }}>
          Once you complete your first daily check-in, your 7-day mood graph,
          common stress triggers, and custom study insights will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="dash-stats-row">
        <div className="stat-card">
          <span className="stat-val">🔥 {studentInfo?.currentStreak || 0}</span>
          <span className="stat-label">Daily Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-val" style={{ fontSize: "1.2rem", height: "43px", display: "flex", alignItems: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {topTrigger.trigger ? topTrigger.trigger : "None logged"}
          </span>
          <span className="stat-label">Top Stressor</span>
        </div>
      </div>

      <div className="card chart-card">
        <div className="chart-header">
          <h3>7-Day Mood Trend</h3>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" />
              <span>Mood Rating (1-5)</span>
            </div>
          </div>
        </div>
        
        <div className="chart-wrapper">
          {renderSVGChart()}
        </div>
      </div>

      {insight && (
        <div className="card insight-card">
          <h3 style={{ color: "var(--color-mint)" }}>🎯 {insight.title}</h3>
          <p className="insight-text">{insight.text}</p>
        </div>
      )}
    </div>
  );
}
