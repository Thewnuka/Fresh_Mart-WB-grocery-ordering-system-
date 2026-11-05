import { useState } from "react";
import { callApi } from "../api";

function LoginPage({ successMessage, onLoginSuccess, onGoToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const result = await callApi("/auth/login", "POST", { email, password });

    if (result.ok) {
      onLoginSuccess(result.data);
    } else {
      setErrorMessage(result.data.message);
      setPassword("");
    }
  }

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-card mx-auto">

          <div className="text-center">
            <img src="/logo.svg" alt="FreshMart logo" className="login-logo" />
            <h1 className="login-brand">FreshMart</h1>
            <p className="login-subtitle">Supermarket Ordering System</p>
          </div>

          <h2 className="login-title">Admin Login</h2>

          {successMessage && !errorMessage && <div className="alert alert-success login-success">{successMessage}</div>}
          {errorMessage && <div className="alert alert-danger login-error">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label login-label">Email</label>
              <input type="email" id="email" className="form-control login-input" placeholder="admin@example.com"
                     value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label login-label">Password</label>
              <input type="password" id="password" className="form-control login-input" placeholder="Enter your password"
                     value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn login-button">Login</button>
          </form>

          <p className="login-switch-text">
            Don't have an account?{" "}
            <button type="button" className="login-switch-link" onClick={onGoToSignUp}>Sign Up</button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
