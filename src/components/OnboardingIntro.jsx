import PropTypes from "prop-types";

/**
 * OnboardingIntro component.
 * Displays the branding details on the onboarding page.
 * 
 * @returns {React.ReactElement} Onboarding introduction block.
 */
export default function OnboardingIntro() {
  return (
    <div className="onboarding-intro">
      <div style={{ fontSize: "3rem", display: "inline-block" }}>🧠</div>
      <h1>Welcome to MindBoard</h1>
      <p>
        Your mental wellness companion built specifically to understand and 
        navigate the unique pressure of competitive exams in India.
      </p>
    </div>
  );
}

OnboardingIntro.propTypes = {};
