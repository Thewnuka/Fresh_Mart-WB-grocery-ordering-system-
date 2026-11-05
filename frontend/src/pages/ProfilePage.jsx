import { useEffect, useState } from "react";
import { callApi, formatDate } from "../api";

// Shows the logged-in admin's profile (read from MySQL through the backend)
function ProfilePage({ onGoToHome, onLogout, onSessionExpired }) {
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the profile from the backend when the page opens
  useEffect(() => {
    callApi("/profile").then((result) => {
      if (result.ok) {
        setProfile(result.data);
      } else if (result.status === 401) {
        onSessionExpired(result.data.message); // not logged in any more: go back to Login
      } else {
        setErrorMessage(result.data.message);
      }
    });
  }, []);

  return (
    <div className="profile-page">
      <nav className="profile-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <span className="profile-navbar-brand">
            <img src="/logo.svg" alt="" className="profile-navbar-logo" /> FreshMart
          </span>
          <div>
            <button type="button" className="btn profile-home-button" onClick={onGoToHome}>Home</button>
            <button type="button" className="btn profile-logout-button" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <h1 className="profile-heading">My Profile</h1>

        {errorMessage && <div className="alert alert-danger profile-load-error">{errorMessage}</div>}
        {!errorMessage && profile === null && <p className="profile-loading">Loading profile...</p>}

        {profile && (
          <div className="row g-4">
            {/* ---------- Summary card ---------- */}
            <div className="col-lg-4">
              <div className="profile-summary-card text-center">
                <div className="profile-avatar">{profile.fullName.charAt(0).toUpperCase()}</div>
                <h2 className="profile-summary-name">{profile.fullName}</h2>
                <p className="profile-summary-email">{profile.email}</p>
                <p className="profile-summary-date">Member since {formatDate(profile.createdAt)}</p>
              </div>
            </div>

            {/* ---------- Personal Information ---------- */}
            <div className="col-lg-8">
              <div className="profile-info-card">
                <h2 className="profile-info-title">Personal Information</h2>

                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label profile-info-label">Full Name</label>
                  <input type="text" id="fullName" className="form-control profile-info-readonly" value={profile.fullName} readOnly />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label profile-info-label">Email Address</label>
                  <input type="email" id="email" className="form-control profile-info-readonly" value={profile.email} readOnly />
                </div>

                <div>
                  <label htmlFor="createdAt" className="form-label profile-info-label">Account Created</label>
                  <input type="text" id="createdAt" className="form-control profile-info-readonly"
                         value={formatDate(profile.createdAt)} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
