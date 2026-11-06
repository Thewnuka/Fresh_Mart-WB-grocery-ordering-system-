import { useEffect, useState } from "react";
import { callApi } from "./api";
import AdminNavbar from "./AdminNavbar";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// Decides which page to show.
// Before login: "login" or "signup".  After login: "dashboard" or "profile".
function App() {
  const [page, setPage] = useState("loading");
  const [admin, setAdmin] = useState(null);
  const [loginMessage, setLoginMessage] = useState("");

  // When the app opens, ask the backend whether an admin is already logged in
  useEffect(() => {
    callApi("/auth/me").then((result) => {
      if (result.ok) {
        setAdmin(result.data);
        setPage("dashboard");
      } else {
        setPage("login");
      }
    });
  }, []);

  function showLoginPage(message = "") {
    setAdmin(null);
    setLoginMessage(message);
    setPage("login");
  }

  function handleLoginSuccess(loggedInAdmin) {
    setAdmin(loggedInAdmin);
    setPage("dashboard");
  }

  async function handleLogout() {
    const result = await callApi("/auth/logout", "POST");
    showLoginPage(result.data.message);
  }

  if (page === "loading") {
    return null;
  }

  // ---------- Pages for a logged-in admin ----------
  if (admin) {
    return (
      <>
        <AdminNavbar activePage={page} onNavigate={setPage} onLogout={handleLogout} />

        {page === "dashboard" && (
          <DashboardPage admin={admin} onNavigate={setPage} onLogout={handleLogout} />
        )}
        {page === "profile" && (
          <ProfilePage onProfileUpdated={setAdmin} onSessionExpired={showLoginPage} />
        )}
      </>
    );
  }

  // ---------- Pages before login ----------
  if (page === "signup") {
    return <SignUpPage onSignUpSuccess={showLoginPage} onGoToLogin={() => showLoginPage()} />;
  }
  return (
    <LoginPage
      successMessage={loginMessage}
      onLoginSuccess={handleLoginSuccess}
      onGoToSignUp={() => setPage("signup")}
    />
  );
}

export default App;
