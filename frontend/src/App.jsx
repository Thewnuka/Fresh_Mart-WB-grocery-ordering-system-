import { useEffect, useState } from "react";
import { callApi } from "./api";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import WelcomePage from "./pages/WelcomePage";

// Decides which page to show: "loading", "login", "signup" or "welcome"
function App() {
  const [page, setPage] = useState("loading");
  const [admin, setAdmin] = useState(null);
  const [loginMessage, setLoginMessage] = useState("");

  // When the app opens, ask the backend whether an admin is already logged in
  useEffect(() => {
    callApi("/auth/me").then((result) => {
      if (result.ok) {
        setAdmin(result.data);
        setPage("welcome");
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
    setPage("welcome");
  }

  async function handleLogout() {
    const result = await callApi("/auth/logout", "POST");
    showLoginPage(result.data.message);
  }

  if (page === "loading") {
    return null;
  }
  // Only a logged-in admin can see the Welcome page
  if (page === "welcome" && admin) {
    return <WelcomePage admin={admin} onLogout={handleLogout} />;
  }
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
