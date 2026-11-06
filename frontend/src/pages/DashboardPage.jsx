// Admin Dashboard: welcome message and quick navigation
function DashboardPage({ admin, onNavigate, onLogout }) {
  return (
    <div className="dashboard-page">
      <div className="container">

        <div className="dashboard-header">
          <h1 className="dashboard-heading">Dashboard</h1>
          <p className="dashboard-welcome">Welcome back, {admin.fullName}!</p>
        </div>

        {/* ---------- Quick navigation ---------- */}
        <div className="dashboard-quick-card">
          <h2 className="dashboard-quick-title">Quick Navigation</h2>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn dashboard-quick-profile" onClick={() => onNavigate("profile")}>
              My Profile
            </button>
            <button type="button" className="btn dashboard-quick-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
