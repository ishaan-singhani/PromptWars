import { useState, useEffect, lazy, Suspense } from "react";
import { 
  loginStudent, 
  fetchOnboarding, 
  getStreak, 
  onAuthStateChangedListener,
  isUsingMock 
} from "./firebase";
import Onboarding from "./components/Onboarding";
import DailyCheckIn from "./components/DailyCheckIn";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import DailyNudgeBanner from "./components/DailyNudgeBanner";
import NavigationBar from "./components/NavigationBar";

const Dashboard = lazy(() => import("./components/Dashboard"));
const ReliefToolkit = lazy(() => import("./components/ReliefToolkit"));

/**
 * Format today's date as a local YYYY-MM-DD string.
 * @returns {string} The formatted local date string.
 */
const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * App component.
 * Root React component for the MindBoard student wellness workspace application.
 * Manages user session state, active navigation tabs, visual theme state,
 * daily nudge display status, and main layouts.
 * 
 * @returns {React.ReactElement} The main app layout.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [streakData, setStreakData] = useState({ currentStreak: 0, lastCheckInDate: null });
  const [activeTab, setActiveTab] = useState("home"); // home, insights, toolkit
  const [loading, setLoading] = useState(true);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Light and Dark theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("mindboard_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mindboard_theme", theme);
  }, [theme]);

  /**
   * Toggles the color theme between light and dark modes.
   */
  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    // Establish Authentication Listener
    const unsubscribe = onAuthStateChangedListener(async (currUser) => {
      if (currUser) {
        setUser(currUser);
        try {
          // Fetch student's onboarding status
          const data = await fetchOnboarding(currUser.uid);
          if (data) {
            setStudentInfo(data);
            
            // Fetch streak data
            const streak = await getStreak(currUser.uid);
            setStreakData(streak);
            
            // Decide if daily check-in nudge is needed
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

  /**
   * Callback when onboarding is successfully completed.
   * @param {object} data Student onboarding details.
   */
  const handleOnboardingComplete = (data) => {
    setStudentInfo(data);
    setStreakData({ currentStreak: 0, lastCheckInDate: null });
    setShowNudge(true);
  };

  /**
   * Callback when daily check-in is successfully completed.
   * @param {object} updatedStreak Updated streak details.
   */
  const handleCheckInComplete = (updatedStreak) => {
    setStreakData(updatedStreak);
    setShowNudge(false); // Hide nudge on checkin
    setStudentInfo(prev => ({
      ...prev,
      currentStreak: updatedStreak.currentStreak
    }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Gate content behind onboarding form
  if (!studentInfo) {
    return (
      <ErrorBoundary>
        <Onboarding uid={user?.uid} onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentStreak={streakData.currentStreak || 0} 
        />

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
            <DailyNudgeBanner
              studentName={studentInfo.name}
              onLogMoodClick={() => setActiveTab("home")}
              onDismiss={() => setNudgeDismissed(true)}
            />
          )}

          {/* Render Tab Contents with individual Error Boundaries */}
          {activeTab === "home" && (
            <ErrorBoundary>
              <DailyCheckIn 
                uid={user.uid} 
                studentInfo={studentInfo} 
                streakData={streakData}
                onCheckInComplete={handleCheckInComplete}
              />
            </ErrorBoundary>
          )}

          {activeTab === "insights" && (
            <ErrorBoundary>
              <Suspense fallback={
                <div className="card" style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                  <div className="spinner" aria-label="Loading dashboard" />
                </div>
              }>
                <Dashboard 
                  uid={user.uid} 
                  studentInfo={{ ...studentInfo, currentStreak: streakData.currentStreak }} 
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {activeTab === "toolkit" && (
            <ErrorBoundary>
              <Suspense fallback={
                <div className="card" style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                  <div className="spinner" aria-label="Loading toolkit" />
                </div>
              }>
                <ReliefToolkit uid={user.uid} />
              </Suspense>
            </ErrorBoundary>
          )}
        </main>

        <NavigationBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      </div>
    </ErrorBoundary>
  );
}
