import { useState } from "react";

// Pages that appear in the navigation bar
const NAV_LINKS = [
  { page: "dashboard", label: "Dashboard" },
  { page: "profile", label: "Profile" },
];

// Top navigation bar shown on every page after login.
// On small screens the links fold into a menu opened by the ☰ button.
function AdminNavbar({ activePage, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function goTo(page) {
    onNavigate(page);
    setMenuOpen(false);
  }

  return (
    <nav className="navbar navbar-expand-lg admin-navbar" data-bs-theme="dark">
      <div className="container">
        <button type="button" className="navbar-brand admin-navbar-brand" onClick={() => goTo("dashboard")}>
          <img src="/logo.svg" alt="" className="admin-navbar-logo" /> FreshMart
        </button>

        <button type="button" className="navbar-toggler admin-navbar-toggler" aria-label="Toggle menu"
                onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={"collapse navbar-collapse" + (menuOpen ? " show" : "")}>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {NAV_LINKS.map((link) => (
              <li className="nav-item" key={link.page}>
                <button type="button"
                        className={"nav-link admin-navbar-link" + (activePage === link.page ? " admin-navbar-link-active" : "")}
                        onClick={() => goTo(link.page)}>
                  {link.label}
                </button>
              </li>
            ))}
            <li className="nav-item">
              <button type="button" className="btn admin-navbar-logout" onClick={onLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
