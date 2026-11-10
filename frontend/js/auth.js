// Login and Sign Up pages.
// login.html and register.html both load this file; each part only runs on its own page.
import { callApi } from "./api.js";
import { showMessage, hideMessage, setButtonLoading, setupPasswordToggles } from "./common.js";

// Same email rule as the backend (AdminService)
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Until the dashboard is rebuilt in plain HTML, a logged-in admin goes to the
// existing React app at "/", which opens its dashboard.
const PAGE_AFTER_LOGIN = "/";

setupPasswordToggles();

if (document.getElementById("login-form")) {
    setupLoginPage();
}
if (document.getElementById("register-form")) {
    setupRegisterPage();
}

// ======================= LOGIN PAGE =======================

async function setupLoginPage() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");
    const errorBox = document.getElementById("login-error");
    const successBox = document.getElementById("login-success");

    // Show the message left by the Sign Up page (for example "Account created successfully")
    const savedMessage = sessionStorage.getItem("loginMessage");
    if (savedMessage) {
        showMessage(successBox, savedMessage);
        sessionStorage.removeItem("loginMessage");
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // stop the browser from reloading the page
        hideMessage(errorBox);
        hideMessage(successBox);

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Simple checks before calling the backend
        if (email === "" || password === "") {
            showMessage(errorBox, "Please enter your email and password.");
            return;
        }
        if (!EMAIL_PATTERN.test(email)) {
            showMessage(errorBox, "Please enter a valid email address.");
            return;
        }

        setButtonLoading(loginButton, true, "Logging in...");
        const result = await callApi("/auth/login", "POST", { email: email, password: password });
        setButtonLoading(loginButton, false);

        if (result.ok) {
            window.location.href = PAGE_AFTER_LOGIN;
        } else {
            showMessage(errorBox, result.data.message);
            passwordInput.value = "";
        }
    });

    // If the admin is already logged in, skip the login page
    const me = await callApi("/auth/me");
    if (me.ok) {
        window.location.href = PAGE_AFTER_LOGIN;
    }
}

// ======================= SIGN UP PAGE =======================

function setupRegisterPage() {
    const form = document.getElementById("register-form");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const registerButton = document.getElementById("register-button");
    const errorBox = document.getElementById("register-error");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // stop the browser from reloading the page
        hideMessage(errorBox);

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // The same rules and messages as the backend, so the admin sees the problem at once.
        // The backend checks everything again.
        let errorMessage = "";
        if (fullName === "" || email === "" || password === "" || confirmPassword === "") {
            errorMessage = "All fields are required.";
        } else if (fullName.length > 100 || email.length > 150) {
            errorMessage = "Full name or email is too long.";
        } else if (!EMAIL_PATTERN.test(email)) {
            errorMessage = "Please enter a valid email address.";
        } else if (password.length < 6) {
            errorMessage = "Password must be at least 6 characters.";
        } else if (password !== confirmPassword) {
            errorMessage = "Passwords do not match.";
        }
        if (errorMessage !== "") {
            showMessage(errorBox, errorMessage);
            return;
        }

        setButtonLoading(registerButton, true, "Creating account...");
        const result = await callApi("/auth/signup", "POST", {
            fullName: fullName,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
        });
        setButtonLoading(registerButton, false);

        if (result.ok) {
            // Only the success message is kept (never the password), then the Login page shows it
            sessionStorage.setItem("loginMessage", result.data.message);
            window.location.href = "login.html";
        } else {
            showMessage(errorBox, result.data.message);
        }
    });
}
