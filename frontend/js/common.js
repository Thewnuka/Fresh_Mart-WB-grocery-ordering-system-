// Small helpers that every page can use.

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
