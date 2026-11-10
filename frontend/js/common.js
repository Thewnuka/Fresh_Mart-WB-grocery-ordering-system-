// Small helpers that every page can use.
import { callApi } from "./api.js";

// Shows a message box (an element with the "hidden" attribute) with the given text
export function showMessage(element, text) {
    element.textContent = text;
    element.hidden = false;
}

// Hides a message box again
export function hideMessage(element) {
    element.textContent = "";
    element.hidden = true;
}

// Disables a button and changes its text while a request is running,
// then puts the original text back when loading is finished
export function setButtonLoading(button, isLoading, loadingText) {
    if (isLoading) {
        button.dataset.normalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.normalText;
        button.disabled = false;
    }
}

// Makes every eye button show or hide its password field.
// Each eye button has data-password-for="<id of the password input>".
export function setupPasswordToggles() {
    const buttons = document.querySelectorAll("[data-password-for]");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.passwordFor);
            const showPassword = input.type === "password";

            input.type = showPassword ? "text" : "password";
            button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
            // A line is drawn across the eye icon while the password is visible
            button.querySelector("line").style.display = showPassword ? "inline" : "none";
        });
    });
}

// ======================= Pages after login =======================

// Opens the Login page. The message (for example "Please log in to continue.") is shown there.
export function goToLogin(message) {
    if (message) {
        sessionStorage.setItem("loginMessage", message);
    }
    window.location.href = "login.html";
}

// Asks the backend who is logged in (the session cookie is sent automatically).
// Returns the admin { fullName, email }, or opens the Login page and returns null.
export async function requireLogin() {
    const result = await callApi("/auth/me");
    if (result.ok) {
        return result.data;
    }
    goToLogin(result.status === 401 ? result.data.message : "");
    return null;
}

// Logs out on the backend and goes back to the Login page
export async function logout() {
    const result = await callApi("/auth/logout", "POST");
    goToLogin(result.ok ? result.data.message : "");
}

// Makes the navigation bar work: shows the admin's name, the Logout button
// and the ☰ button that opens the menu on small screens
export function setupNavbar(admin) {
    document.getElementById("navbar-admin-name").textContent = admin.fullName;
    document.getElementById("navbar-logout-button").addEventListener("click", logout);

    const menu = document.getElementById("navbar-menu");
    document.getElementById("navbar-toggler").addEventListener("click", () => {
        menu.classList.toggle("show");
    });
}

// Makes text safe to put inside HTML (so a name like "<b>" is shown as text, not as HTML)
export function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text === null || text === undefined ? "" : String(text);
    return div.innerHTML;
}

// Turns a date from the backend such as "2026-11-06T01:13:18" into "6 November 2026"
export function formatDate(dateText) {
    return new Date(dateText).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Turns 1450 into "Rs. 1,450.00"
export function formatPrice(price) {
    return "Rs. " + Number(price).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
