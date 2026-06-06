/**
 * EmptyState component.
 * Displays when dashboard history has no logged records.
 * 
 * @returns {React.ReactElement} Empty dashboard placeholder display.
 */
export default function EmptyState() {
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
