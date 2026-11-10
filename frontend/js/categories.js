// Category Management: view, search, add, edit and delete categories
import { callApi } from "./api.js";
import {
    requireLogin, setupNavbar, goToLogin, showMessage, hideMessage,
    setButtonLoading, escapeHtml, formatDate,
} from "./common.js";

// Elements used on this page
const successBox = document.getElementById("category-success");
const errorBox = document.getElementById("category-error");
const formCard = document.getElementById("category-form-card");
const formTitle = document.getElementById("category-form-title");
const form = document.getElementById("category-form");
const nameInput = document.getElementById("categoryName");
const descriptionInput = document.getElementById("categoryDescription");
const saveButton = document.getElementById("category-save-button");
const searchInput = document.getElementById("category-search");
const tableBody = document.getElementById("category-table-body");
const viewOverlay = document.getElementById("category-view-overlay");

let categories = [];          // all categories loaded from the backend
let editingCategory = null;   // the category being edited, or null when adding a new one

startPage();

async function startPage() {
    const admin = await requireLogin(); // opens the Login page if nobody is logged in
    if (admin === null) {
        return;
    }
    setupNavbar(admin);

    document.getElementById("category-add-button").addEventListener("click", () => openForm(null));
    document.getElementById("category-cancel-button").addEventListener("click", () => (formCard.hidden = true));
    document.getElementById("category-view-close-button").addEventListener("click", () => (viewOverlay.hidden = true));
    viewOverlay.addEventListener("click", (event) => {
        if (event.target === viewOverlay) {
            viewOverlay.hidden = true; // clicking outside the window closes it
        }
    });
    searchInput.addEventListener("input", showCategories);
    form.addEventListener("submit", saveCategory);

    loadCategories();
}

// ---------- Messages ----------

// Shows the backend's answer to a save or delete. Returns true when it worked.
function showResult(result) {
    if (result.status === 401) {
        goToLogin(result.data.message); // the session has expired
        return false;
    }
    if (result.ok) {
        hideMessage(errorBox);
        showMessage(successBox, result.data.message);
    } else {
        hideMessage(successBox);
        showMessage(errorBox, result.data.message);
    }
    return result.ok;
}

// ---------- Category list ----------

async function loadCategories() {
    const result = await callApi("/categories");
    if (result.ok) {
        categories = result.data;
        showCategories();
    } else if (result.status === 401) {
        goToLogin(result.data.message);
    } else {
        tableBody.innerHTML = `<tr><td colspan="4" class="category-empty">Categories could not be loaded.</td></tr>`;
        showMessage(errorBox, result.data.message);
    }
}

// Fills the table with the categories whose name matches the search box
function showCategories() {
    const search = searchInput.value.trim().toLowerCase();
    const visibleCategories = categories.filter((category) => category.name.toLowerCase().includes(search));

    if (visibleCategories.length === 0) {
        const text = categories.length === 0 ? "No categories have been added yet." : "No categories found.";
        tableBody.innerHTML = `<tr><td colspan="4" class="category-empty">${text}</td></tr>`;
        return;
    }

    let rows = "";
    for (const category of visibleCategories) {
        rows += `
            <tr>
                <td>${category.id}</td>
                <td class="category-name-cell">${escapeHtml(category.name)}</td>
                <td>${escapeHtml(category.description)}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn category-view-button" data-id="${category.id}">View</button>
                    <button type="button" class="btn category-edit-button" data-id="${category.id}">Edit</button>
                    <button type="button" class="btn category-delete-button" data-id="${category.id}">Delete</button>
                </td>
            </tr>`;
    }
    tableBody.innerHTML = rows;

    // Connect the buttons of every row (data-id tells us which category was clicked)
    tableBody.querySelectorAll(".category-view-button").forEach((button) =>
        button.addEventListener("click", () => viewCategory(button.dataset.id)));
    tableBody.querySelectorAll(".category-edit-button").forEach((button) =>
        button.addEventListener("click", () => openForm(findCategory(button.dataset.id))));
    tableBody.querySelectorAll(".category-delete-button").forEach((button) =>
        button.addEventListener("click", () => deleteCategory(findCategory(button.dataset.id))));
}

function findCategory(id) {
    return categories.find((category) => String(category.id) === id);
}

// ---------- Add / Edit ----------

// Opens the form; category is null when adding a new category
function openForm(category) {
    editingCategory = category;
    formTitle.textContent = category === null ? "Add New Category" : "Edit Category";
    saveButton.textContent = category === null ? "Add Category" : "Save Changes";
    nameInput.value = category === null ? "" : category.name;
    descriptionInput.value = category === null ? "" : category.description || "";
    formCard.hidden = false;
    hideMessage(successBox);
    hideMessage(errorBox);
    window.scrollTo(0, 0);
    nameInput.focus();
}

async function saveCategory(event) {
    event.preventDefault(); // stop the browser from reloading the page

    // Quick check in the browser; the backend checks everything again
    if (nameInput.value.trim() === "") {
        hideMessage(successBox);
        showMessage(errorBox, "Category name is required.");
        return;
    }

    const body = { name: nameInput.value, description: descriptionInput.value };
    setButtonLoading(saveButton, true, "Saving...");
    const result = editingCategory === null
        ? await callApi("/categories", "POST", body)
        : await callApi("/categories/" + editingCategory.id, "PUT", body);
    setButtonLoading(saveButton, false);

    if (showResult(result)) {
        formCard.hidden = true;
        loadCategories();
    }
}

// ---------- View details ----------

// Loads the details (including the number of items) from the backend and shows them in a window
async function viewCategory(id) {
    const result = await callApi("/categories/" + id);
    if (!result.ok) {
        showResult(result);
        return;
    }
    const category = result.data;
    document.getElementById("category-view-title").textContent = category.name;
    document.getElementById("view-category-id").textContent = category.id;
    document.getElementById("view-category-name").textContent = category.name;
    document.getElementById("view-category-description").textContent = category.description || "No description";
    document.getElementById("view-category-item-count").textContent = category.itemCount;
    document.getElementById("view-category-created").textContent = formatDate(category.createdAt);
    viewOverlay.hidden = false;
}

// ---------- Delete ----------

async function deleteCategory(category) {
    // Ask first; if the admin clicks Cancel nothing is sent to the server
    if (!window.confirm('Delete the category "' + category.name + '"?')) {
        return;
    }
    // The backend refuses to delete a category that still has items and explains why
    const result = await callApi("/categories/" + category.id, "DELETE");
    if (showResult(result)) {
        formCard.hidden = true;
        loadCategories();
    }
    window.scrollTo(0, 0); // the message is at the top of the page
}
