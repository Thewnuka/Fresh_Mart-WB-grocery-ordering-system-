// My Profile: shows the logged-in admin's details, lets them edit their name and email
// and change their password
import { callApi } from "./api.js";
import {
    requireLogin, setupNavbar, goToLogin, showMessage, hideMessage,
    setButtonLoading, setupPasswordToggles, formatDate,
} from "./common.js";

// Same email rule as the backend (AdminService)
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Personal Information form
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const editButton = document.getElementById("profile-edit-button");
const editButtons = document.getElementById("profile-edit-buttons");
const saveButton = document.getElementById("profile-save-button");
const infoSuccess = document.getElementById("profile-info-success");
const infoError = document.getElementById("profile-info-error");

// Change Password form
const passwordForm = document.getElementById("password-form");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmNewPassword");
const passwordButton = document.getElementById("profile-password-button");
const passwordSuccess = document.getElementById("profile-password-success");
const passwordError = document.getElementById("profile-password-error");

let profile = null; // the saved profile { fullName, email, createdAt } from MySQL

startPage();

async function startPage() {
    const admin = await requireLogin(); // opens the Login page if nobody is logged in
    if (admin === null) {
        return;
    }
    setupNavbar(admin);
    setupPasswordToggles();

    editButton.addEventListener("click", startEditing);
    document.getElementById("profile-cancel-button").addEventListener("click", cancelEditing);
    document.getElementById("profile-form").addEventListener("submit", saveProfile);
    passwordForm.addEventListener("submit", changePassword);
    document.getElementById("profile-password-clear-button").addEventListener("click", () => {
        passwordForm.reset();
        hideMessage(passwordSuccess);
        hideMessage(passwordError);
    });

    loadProfile();
}

// ======================= View profile =======================

async function loadProfile() {
    const result = await callApi("/profile");
    document.getElementById("profile-loading").hidden = true;

    if (result.ok) {
        showProfile(result.data);
        document.getElementById("profile-content").hidden = false;
    } else if (result.status === 401) {
        goToLogin(result.data.message); // the session has expired
    } else {
        showMessage(document.getElementById("profile-load-error"), result.data.message);
    }
}

// Puts the saved profile into the summary card, the form and the navigation bar
function showProfile(data) {
    profile = data;
    document.getElementById("profile-avatar").textContent = data.fullName.charAt(0).toUpperCase();
    document.getElementById("profile-summary-name").textContent = data.fullName;
    document.getElementById("profile-summary-email").textContent = data.email;
    document.getElementById("profile-summary-date").textContent = "Member since " + formatDate(data.createdAt);
    document.getElementById("navbar-admin-name").textContent = data.fullName;

    fullNameInput.value = data.fullName;
    emailInput.value = data.email;
    document.getElementById("createdAt").value = formatDate(data.createdAt);
}

// ======================= Edit profile =======================

// Switches the Full Name and Email fields between "view" (read-only) and "edit"
function setEditing(isEditing) {
    for (const input of [fullNameInput, emailInput]) {
        input.readOnly = !isEditing;
        input.classList.toggle("profile-info-input", isEditing);
        input.classList.toggle("profile-info-readonly", !isEditing);
    }
    editButton.hidden = isEditing;
    editButtons.hidden = !isEditing;
}

function startEditing() {
    hideMessage(infoSuccess);
    hideMessage(infoError);
    setEditing(true);
    fullNameInput.focus();
}

// Cancel: throw away the changes and show the saved values again
function cancelEditing() {
    fullNameInput.value = profile.fullName;
    emailInput.value = profile.email;
    hideMessage(infoError);
    setEditing(false);
}

async function saveProfile(event) {
    event.preventDefault(); // stop the browser from reloading the page
    hideMessage(infoSuccess);
    hideMessage(infoError);

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();

    // The same rules and messages as the backend, which checks everything again
    let errorMessage = "";
    if (fullName === "" || email === "") {
        errorMessage = "Full name and email are required.";
    } else if (fullName.length > 100 || email.length > 150) {
        errorMessage = "Full name or email is too long.";
    } else if (!EMAIL_PATTERN.test(email)) {
        errorMessage = "Please enter a valid email address.";
    }
    if (errorMessage !== "") {
        showMessage(infoError, errorMessage);
        return;
    }

    setButtonLoading(saveButton, true, "Saving...");
    const result = await callApi("/profile", "PUT", { fullName: fullName, email: email });
    setButtonLoading(saveButton, false);

    if (result.ok) {
        showProfile(result.data); // the backend sends back the saved profile
        showMessage(infoSuccess, result.data.message);
        setEditing(false);
    } else if (result.status === 401) {
        goToLogin(result.data.message);
    } else {
        showMessage(infoError, result.data.message);
    }
}

// ======================= Change password =======================

async function changePassword(event) {
    event.preventDefault(); // stop the browser from reloading the page
    hideMessage(passwordSuccess);
    hideMessage(passwordError);

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // The same rules and messages as the backend, which checks everything again
    // (including whether the current password is correct)
    let errorMessage = "";
    if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
        errorMessage = "All password fields are required.";
    } else if (newPassword.length < 6) {
        errorMessage = "Password must be at least 6 characters.";
    } else if (newPassword !== confirmPassword) {
        errorMessage = "Passwords do not match.";
    }
    if (errorMessage !== "") {
        showMessage(passwordError, errorMessage);
        return;
    }

    setButtonLoading(passwordButton, true, "Changing...");
    const result = await callApi("/profile/password", "PUT", {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
    });
    setButtonLoading(passwordButton, false);

    if (result.ok) {
        // The admin stays logged in (same as before); only the fields are emptied
        showMessage(passwordSuccess, result.data.message);
        passwordForm.reset();
    } else if (result.status === 401) {
        goToLogin(result.data.message);
    } else {
        showMessage(passwordError, result.data.message);
    }
}
