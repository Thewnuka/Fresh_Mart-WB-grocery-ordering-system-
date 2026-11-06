import { useEffect, useState } from "react";
import { callApi, formatDate } from "../api";
import PasswordInput from "../PasswordInput";

// Shows the logged-in admin's profile, lets them edit their name and email and change their password
function ProfilePage({ onProfileUpdated, onSessionExpired }) {
  // Saved profile from MySQL (shown in the summary card)
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Personal Information form
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load the profile from the backend when the page opens
  useEffect(() => {
    callApi("/profile").then((result) => {
      if (result.ok) {
        showProfile(result.data);
      } else if (result.status === 401) {
        onSessionExpired(result.data.message); // not logged in any more: go back to Login
      } else {
        setErrorMessage(result.data.message);
      }
    });
  }, []);

  function showProfile(data) {
    setProfile(data);
    setFullName(data.fullName);
    setEmail(data.email);
  }

  function startEditing() {
    setProfileSuccess("");
    setProfileError("");
    setIsEditing(true);
  }

  // Cancel: throw away the changes and show the saved values again
  function cancelEditing() {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setProfileError("");
    setIsEditing(false);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    const result = await callApi("/profile", "PUT", { fullName, email });

    if (result.ok) {
      showProfile(result.data);
      setProfileSuccess(result.data.message);
      setIsEditing(false);
      onProfileUpdated(result.data); // so the Dashboard shows the new name too
    } else if (result.status === 401) {
      onSessionExpired(result.data.message);
    } else {
      setProfileError(result.data.message);
    }
  }

  // Empties the three password fields
  function clearPasswordFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    const result = await callApi("/profile/password", "PUT", { currentPassword, newPassword, confirmPassword });

    if (result.ok) {
      setPasswordSuccess(result.data.message);
      clearPasswordFields();
    } else if (result.status === 401) {
      onSessionExpired(result.data.message);
    } else {
      setPasswordError(result.data.message);
    }
  }

  return (
    <div className="profile-page">
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

            {/* ---------- Personal Information (view / edit) ---------- */}
            <div className="col-lg-8">
              <div className="profile-info-card">
                <h2 className="profile-info-title">Personal Information</h2>

                {profileSuccess && <div className="alert alert-success profile-info-success">{profileSuccess}</div>}
                {profileError && <div className="alert alert-danger profile-info-error">{profileError}</div>}

                {/* noValidate: all checks are done by the backend, so its clear messages are shown */}
                <form onSubmit={handleProfileSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label profile-info-label">Full Name</label>
                    <input type="text" id="fullName" maxLength="100" readOnly={!isEditing}
                           className={"form-control " + (isEditing ? "profile-info-input" : "profile-info-readonly")}
                           value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label profile-info-label">Email Address</label>
                    <input type="email" id="email" maxLength="150" readOnly={!isEditing}
                           className={"form-control " + (isEditing ? "profile-info-input" : "profile-info-readonly")}
                           value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="createdAt" className="form-label profile-info-label">Account Created</label>
                    <input type="text" id="createdAt" className="form-control profile-info-readonly"
                           value={formatDate(profile.createdAt)} readOnly />
                  </div>

                  {isEditing ? (
                    <div>
                      <button type="submit" className="btn profile-save-button">Save Changes</button>
                      <button type="button" className="btn profile-cancel-button" onClick={cancelEditing}>Cancel</button>
                    </div>
                  ) : (
                    <button type="button" className="btn profile-edit-button" onClick={startEditing}>Edit Profile</button>
                  )}
                </form>
              </div>

              {/* ---------- Change Password ---------- */}
              <div className="profile-password-card">
                <h2 className="profile-password-title">Change Password</h2>

                {passwordSuccess && <div className="alert alert-success profile-password-success">{passwordSuccess}</div>}
                {passwordError && <div className="alert alert-danger profile-password-error">{passwordError}</div>}

                {/* noValidate: all checks are done by the backend, so its clear messages are shown */}
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label profile-password-label">Current Password</label>
                    <PasswordInput id="currentPassword" placeholder="Enter your current password"
                                   value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                   inputClassName="profile-password-input" buttonClassName="profile-eye-button" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label profile-password-label">New Password</label>
                    <PasswordInput id="newPassword" placeholder="At least 6 characters"
                                   value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                   inputClassName="profile-password-input" buttonClassName="profile-eye-button" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmNewPassword" className="form-label profile-password-label">Confirm New Password</label>
                    <PasswordInput id="confirmNewPassword" placeholder="Re-enter the new password"
                                   value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                   inputClassName="profile-password-input" buttonClassName="profile-eye-button" />
                  </div>

                  <button type="submit" className="btn profile-password-button">Change Password</button>
                  <button type="button" className="btn profile-password-clear-button"
                          onClick={() => { clearPasswordFields(); setPasswordSuccess(""); setPasswordError(""); }}>Clear</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
