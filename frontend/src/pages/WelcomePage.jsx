// Temporary page shown after a successful login (replaced by the Dashboard in a later commit)
function WelcomePage({ admin, onLogout }) {
  return (
    <div className="welcome-page">
      <nav className="welcome-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <span className="welcome-navbar-brand">
            <img src="/logo.svg" alt="" className="welcome-navbar-logo" /> FreshMart
          </span>
          <button type="button" className="btn welcome-logout-button" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="welcome-card mx-auto text-center">
          <img src="/logo.svg" alt="FreshMart logo" className="welcome-logo" />
          <h1 className="welcome-heading">
            Welcome, <span className="welcome-name">{admin.fullName}</span>!
          </h1>
          <p className="welcome-text">
            You are logged in as <strong>{admin.email}</strong>.
          </p>
          <p className="welcome-note">More admin features will be added soon.</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
