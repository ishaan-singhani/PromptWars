import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getMoodHistory } from "../firebase";
import EmptyState from "./EmptyState";
import StatsRow from "./StatsRow";
import MoodTrendChart from "./MoodTrendChart";
import InsightCard from "./InsightCard";

// Mood score mappings
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

/**
 * Dashboard component.
 * Displays mood history statistics, 7-day SVG trend chart, and personalized insights for the student.
 * 
 * @param {object} props The component props.
 * @param {string} props.uid Unique user session ID.
 * @param {object} props.studentInfo Profile details of the student.
 * @returns {React.ReactElement} Dashboard panel views.
 */
export default function Dashboard({ uid, studentInfo }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      try {
        const data = await getMoodHistory(uid);
        if (active) {
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load mood history:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadHistory();

    return () => {
      active = false;
    };
  }, [uid]);

  /**
   * Processes the history entries to map them to the last 7 calendar days.
   * @returns {array} Chronological array of daily mood logs.
   */
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

  /**
   * Identifies the most common stress trigger log in the user's history.
   * @returns {object} Object describing top trigger name and count.
   */
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

  /**
   * Generates personalized study and wellness encouragement.
   * @returns {object|null} The title and text of the generated insight card.
   */
  const generateInsights = () => {
    const lastSevenDays = processSevenDaysData();
    const checkedInDays = lastSevenDays.filter(d => d.value !== null);
    if (checkedInDays.length === 0) return null;

    const anxiousCount = history.filter(h => h.mood === "Anxious").length;
    const burntOutCount = history.filter(h => h.mood === "Burnt Out").length;
    const tiredCount = history.filter(h => h.mood === "Tired").length;
    const topTrigger = getMostCommonTrigger();

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

  if (loading) {
    return (
      <div className="card" style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div className="spinner" aria-label="Loading dashboard analytics" />
      </div>
    );
  }

  if (history.length === 0) {
    return <EmptyState />;
  }

  const lastSevenDays = processSevenDaysData();
  const topTrigger = getMostCommonTrigger();
  const insight = generateInsights();

  return (
    <div className="dashboard-grid">
      <StatsRow
        currentStreak={studentInfo?.currentStreak}
        topTrigger={topTrigger.trigger || null}
      />
      <MoodTrendChart
        lastSevenDays={lastSevenDays}
        moodEmojis={moodEmojis}
      />
      <InsightCard insight={insight} />
    </div>
  );
}

Dashboard.propTypes = {
  uid: PropTypes.string.isRequired,
  studentInfo: PropTypes.shape({
    currentStreak: PropTypes.number,
    targetExam: PropTypes.string
  }).isRequired
};
