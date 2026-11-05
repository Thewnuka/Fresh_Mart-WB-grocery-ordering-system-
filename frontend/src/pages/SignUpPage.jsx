import { useState } from "react";
import { callApi } from "../api";
import PasswordInput from "../PasswordInput";

function SignUpPage({ onSignUpSuccess, onGoToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    const result = await callApi("/auth/signup", "POST", { fullName, email, password, confirmPassword });

    // All validation is done by the backend; we only show its message
    if (result.ok) {
      onSignUpSuccess(result.data.message);
    } else {
      setErrorMessage(result.data.message);
    }
  }

  return (
    <div className="signup-page">
      <div className="container">
        <div className="signup-card mx-auto">

          <div className="text-center">
            <img src="/logo.svg" alt="FreshMart logo" className="signup-logo" />
            <h1 className="signup-brand">FreshMart</h1>
            <p className="signup-subtitle">Supermarket Ordering System</p>
          </div>

          <h2 className="signup-title">Create Admin Account</h2>

          {errorMessage && <div className="alert alert-danger signup-error">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label signup-label">Full Name</label>
              <input type="text" id="fullName" className="form-control signup-input" placeholder="John Perera"
                     maxLength="100" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label signup-label">Email</label>
              <input type="email" id="email" className="form-control signup-input" placeholder="admin@example.com"
                     maxLength="150" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label signup-label">Password</label>
              <PasswordInput id="password" placeholder="At least 6 characters"
                             value={password} onChange={(e) => setPassword(e.target.value)}
                             inputClassName="signup-input" buttonClassName="signup-eye-button" />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label signup-label">Confirm Password</label>
              <PasswordInput id="confirmPassword" placeholder="Re-enter your password"
                             value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                             inputClassName="signup-input" buttonClassName="signup-eye-button" />
            </div>

            <button type="submit" className="btn signup-button">Sign Up</button>
          </form>

          <p className="signup-switch-text">
            Already have an account?{" "}
            <button type="button" className="signup-switch-link" onClick={onGoToLogin}>Login</button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
