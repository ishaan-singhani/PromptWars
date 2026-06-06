import React, { useState, useEffect } from "react";
import { 
  loginStudent, 
  fetchOnboarding, 
  getStreak, 
  onAuthStateChangedListener,
  isUsingMock 
} from "./firebase";
import Onboarding from "./components/Onboarding";
import DailyCheckIn from "./components/DailyCheckIn";
import Dashboard from "./components/Dashboard";
import ReliefToolkit from "./components/ReliefToolkit";

export default function App() {
  const [user, setUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [streakData, setStreakData] = useState({ currentStreak: 0, lastCheckInDate: null });
  const [activeTab, setActiveTab] = useState("home"); // home, insights, toolkit
  const [loading, setLoading] = useState(true);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Helper: check if date is today (YYYY-MM-DD)
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 1. Establish Authentication Listener
    const unsubscribe = onAuthStateChangedListener(async (currUser) => {
      if (currUser) {
        setUser(currUser);
        try {
          // 2. Fetch student's onboarding status
          const data = await fetchOnboarding(currUser.uid);
          if (data) {
            setStudentInfo(data);
            
            // 3. Fetch streak data
            const streak = await getStreak(currUser.uid);
            setStreakData(streak);
            
            // 4. Decide if daily check-in nudge is needed
            const todayStr = getTodayStr();
            if (streak?.lastCheckInDate !== todayStr) {
              setShowNudge(true);
            } else {
              setShowNudge(false);
            }
          }
        } catch (err) {
          console.error("Auth initialization error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        // No user logged in yet. Execute anonymous login.
        try {
          await loginStudent();
        } catch (err) {
          console.error("Anonymous authentication failed:", err);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Callback when onboarding completes
  const handleOnboardingComplete = (data) => {
    setStudentInfo(data);
    setStreakData({ currentStreak: 0, lastCheckInDate: null });
    setShowNudge(true);
  };

  // Callback when check-in completes
  const handleCheckInComplete = (updatedStreak) => {
    setStreakData(updatedStreak);
    setShowNudge(false); // Hide nudge on checkin
    // Refresh studentInfo with streak data
    setStudentInfo(prev => ({
      ...prev,
      currentStreak: updatedStreak.currentStreak
    }));
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-dark)",
        color: "var(--color-text-secondary)"
      }}>
        <div className="spinner" aria-label="Authenticating user" style={{ marginBottom: "1rem" }} />
        <p style={{ fontStyle: "italic" }}>MindBoard is opening doors...</p>
      </div>
    );
  }

  // Gate content behind onboarding form
  if (!studentInfo) {
    return <Onboarding uid={user?.uid} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" aria-label="MindBoard Brand Logo">
            MindBoard <span>🧠</span>
          </div>
        </div>
        <div className="header-meta">
          <div 
            className="streak-badge" 
            aria-label={`Current check in streak: ${streakData.currentStreak || 0} days`}
          >
            🔥 {streakData.currentStreak || 0}
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="main-content">
        
        {/* Mock Mode Alert Indicator */}
        {isUsingMock() && (
          <div style={{
            fontSize: "0.8rem",
            backgroundColor: "rgba(111, 255, 233, 0.05)",
            border: "1px solid rgba(111, 255, 233, 0.2)",
            color: "var(--color-text-secondary)",
            padding: "8px 12px",
            borderRadius: "var(--border-radius-sm)",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "6px"
          }}>
            <span>⚙️</span> Local Database Sandbox active. Complete check-ins to test logs.
          </div>
        )}

        {/* Daily Nudge Banner */}
        {showNudge && !nudgeDismissed && (
          <div className="notification-banner" role="status" aria-live="polite">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>👋</span>
              <p>
                Hey <span>{studentInfo.name}</span>, how are you holding up today? Take a second to check in.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                className="btn-primary" 
                style={{ width: "auto", minWidth: "80px", padding: "6px 12px", fontSize: "0.8rem", minHeight: "34px" }}
                onClick={() => setActiveTab("home")}
                aria-label="Navigate to home check in"
              >
                Log Mood
              </button>
              <button 
                className="btn-banner-close"
                onClick={() => setNudgeDismissed(true)}
                aria-label="Dismiss check-in reminder nudge"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Render Tab Contents */}
        {activeTab === "home" && (
          <DailyCheckIn 
            uid={user.uid} 
            studentInfo={studentInfo} 
            streakData={streakData}
            onCheckInComplete={handleCheckInComplete}
          />
        )}

        {activeTab === "insights" && (
          <Dashboard 
            uid={user.uid} 
            studentInfo={{ ...studentInfo, currentStreak: streakData.currentStreak }} 
          />
        )}

        {activeTab === "toolkit" && (
          <ReliefToolkit uid={user.uid} />
        )}
      </main>

      {/* Navigation Bar (Bottom on Mobile, Left Sidebar on Desktop) */}
      <nav className="bottom-nav" aria-label="Primary navigation menu">
        <button
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
          role="tab"
          aria-selected={activeTab === "home"}
          aria-label="Home page daily check-in tab"
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
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Relief Toolkit</span>
        </button>
      </nav>
    </div>
  );
}
