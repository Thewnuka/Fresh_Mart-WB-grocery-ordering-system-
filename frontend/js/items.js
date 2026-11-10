// Item Management: view, search, add, edit and delete items (with images),
// and move an item to another category
import { callApi, itemImageUrl } from "./api.js";
import {
    requireLogin, setupNavbar, goToLogin, showMessage, hideMessage,
    setButtonLoading, escapeHtml, formatDate, formatPrice,
} from "./common.js";

// Same image rules as the backend (ItemService and application.properties)
const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

// Elements used on this page
const successBox = document.getElementById("item-success");
const errorBox = document.getElementById("item-error");
const searchInput = document.getElementById("item-search");
const tableBody = document.getElementById("item-table-body");
const viewOverlay = document.getElementById("item-view-overlay");

// Add / Edit form
const formCard = document.getElementById("item-form-card");
const form = document.getElementById("item-form");
const nameInput = document.getElementById("itemName");
const categorySelect = document.getElementById("itemCategory");
const priceInput = document.getElementById("itemPrice");
const stockInput = document.getElementById("itemStock");
const descriptionInput = document.getElementById("itemDescription");
const imageInput = document.getElementById("itemImage");
const imagePreview = document.getElementById("item-form-image");
const saveButton = document.getElementById("item-save-button");

// Assign Category form
const assignCard = document.getElementById("item-assign-card");
const assignForm = document.getElementById("item-assign-form");
const assignItemSelect = document.getElementById("assignItem");
const assignCategorySelect = document.getElementById("assignCategory");
const assignSaveButton = document.getElementById("item-assign-save-button");

let items = [];            // all items loaded from the backend
let categories = [];       // all categories (for the drop-down lists)
let editingItem = null;    // the item being edited, or null when adding a new one

startPage();

async function startPage() {
    const admin = await requireLogin(); // opens the Login page if nobody is logged in
    if (admin === null) {
        return;
    }
    setupNavbar(admin);

    document.getElementById("item-add-button").addEventListener("click", () => openForm(null));
    document.getElementById("item-cancel-button").addEventListener("click", () => (formCard.hidden = true));
    document.getElementById("item-assign-button").addEventListener("click", openAssignForm);
    document.getElementById("item-assign-cancel-button").addEventListener("click", () => (assignCard.hidden = true));
    document.getElementById("item-view-close-button").addEventListener("click", () => (viewOverlay.hidden = true));
    viewOverlay.addEventListener("click", (event) => {
        if (event.target === viewOverlay) {
            viewOverlay.hidden = true; // clicking outside the window closes it
        }
    });
    searchInput.addEventListener("input", showItems);
    imageInput.addEventListener("change", previewChosenImage);
    assignItemSelect.addEventListener("change", chooseAssignItem);
    form.addEventListener("submit", saveItem);
    assignForm.addEventListener("submit", saveAssignment);

    loadCategories();
    loadItems();
}

// ---------- Messages and small helpers ----------

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

function showError(text) {
    hideMessage(successBox);
    showMessage(errorBox, text);
}

// Shows a picture; if the file cannot be loaded the "No Image" placeholder is shown instead
function setImage(img, url) {
    img.onerror = () => {
        img.onerror = null;
        img.src = "/no-image.svg";
    };
    img.src = url;
}

// Builds the <option> list for a category drop-down
function categoryOptions() {
    let options = `<option value="">-- Select a category --</option>`;
    for (const category of categories) {
        options += `<option value="${category.id}">${escapeHtml(category.name)}</option>`;
    }
    return options;
}

function findItem(id) {
    return items.find((item) => String(item.id) === String(id));
}

// ---------- Loading data ----------

async function loadCategories() {
    const result = await callApi("/categories");
    if (result.ok) {
        categories = result.data;
        categorySelect.innerHTML = categoryOptions();
    }
}

async function loadItems() {
    const result = await callApi("/items");
    if (result.ok) {
        items = result.data;
        showItems();
    } else if (result.status === 401) {
        goToLogin(result.data.message);
    } else {
        tableBody.innerHTML = `<tr><td colspan="7" class="item-empty">Items could not be loaded.</td></tr>`;
        showError(result.data.message);
    }
}

// ---------- Item list ----------

// Fills the table with the items whose name matches the search box
function showItems() {
    const search = searchInput.value.trim().toLowerCase();
    const visibleItems = items.filter((item) => item.name.toLowerCase().includes(search));

    if (visibleItems.length === 0) {
        const text = items.length === 0 ? "No items have been added yet." : "No items found.";
        tableBody.innerHTML = `<tr><td colspan="7" class="item-empty">${text}</td></tr>`;
        return;
    }

    let rows = "";
    for (const item of visibleItems) {
        // onerror shows the "No Image" placeholder if the image file cannot be loaded
        rows += `
            <tr>
                <td>
                    <img src="${escapeHtml(itemImageUrl(item.imageName))}" alt="${escapeHtml(item.name)}" class="item-table-image"
                         onerror="this.onerror = null; this.src = '/no-image.svg';">
                </td>
                <td>${item.id}</td>
                <td>
                    <div class="item-name-text">${escapeHtml(item.name)}</div>
                    <div class="item-description-text">${escapeHtml(item.description)}</div>
                </td>
                <td class="text-nowrap">${escapeHtml(item.category.name)}</td>
                <td class="text-nowrap">${formatPrice(item.price)}</td>
                <td>${item.stockQuantity}</td>
                <td class="text-end text-nowrap">
                    <button type="button" class="btn item-view-button" data-id="${item.id}">View</button>
                    <button type="button" class="btn item-edit-button" data-id="${item.id}">Edit</button>
                    <button type="button" class="btn item-delete-button" data-id="${item.id}">Delete</button>
                </td>
            </tr>`;
    }
    tableBody.innerHTML = rows;

    // Connect the buttons of every row (data-id tells us which item was clicked)
    tableBody.querySelectorAll(".item-view-button").forEach((button) =>
        button.addEventListener("click", () => viewItem(findItem(button.dataset.id))));
    tableBody.querySelectorAll(".item-edit-button").forEach((button) =>
        button.addEventListener("click", () => openForm(findItem(button.dataset.id))));
    tableBody.querySelectorAll(".item-delete-button").forEach((button) =>
        button.addEventListener("click", () => deleteItem(findItem(button.dataset.id))));
}

// ---------- Add / Edit ----------

// Opens the form; item is null when adding a new item
function openForm(item) {
    editingItem = item;
    document.getElementById("item-form-title").textContent = item === null ? "Add New Item" : "Edit Item";
    saveButton.textContent = item === null ? "Add Item" : "Save Changes";
    document.getElementById("item-image-hint").textContent = "JPG, PNG, GIF or WEBP, up to 5 MB. "
        + (item === null ? "Optional." : "Leave empty to keep the current image.");

    nameInput.value = item === null ? "" : item.name;
    categorySelect.value = item === null ? "" : String(item.category.id);
    priceInput.value = item === null ? "" : item.price;
    stockInput.value = item === null ? "" : item.stockQuantity;
    descriptionInput.value = item === null ? "" : item.description || "";
    imageInput.value = ""; // no new image chosen yet
    setImage(imagePreview, itemImageUrl(item === null ? null : item.imageName));

    assignCard.hidden = true;
    formCard.hidden = false;
    hideMessage(successBox);
    hideMessage(errorBox);
    window.scrollTo(0, 0);
    nameInput.focus();
}

// Shows the chosen picture in the form before it is uploaded
function previewChosenImage() {
    const file = imageInput.files[0];
    if (file) {
        setImage(imagePreview, URL.createObjectURL(file));
    }
}

// Returns an error message for the form, or "" when everything looks fine.
// These are the same rules and messages as the backend, which checks everything again.
function checkItemForm() {
    const price = Number(priceInput.value);
    const stock = Number(stockInput.value);
    const file = imageInput.files[0];

    if (nameInput.value.trim() === "") {
        return "Item name is required.";
    }
    if (priceInput.value.trim() === "" || isNaN(price)) {
        return "Please enter a valid price.";
    }
    if (price <= 0) {
        return "Price must be greater than zero.";
    }
    if (stockInput.value.trim() === "" || !Number.isInteger(stock)) {
        return "Stock quantity must be a whole number.";
    }
    if (stock < 0) {
        return "Stock quantity cannot be negative.";
    }
    if (categorySelect.value === "") {
        return "Please select a valid category.";
    }
    if (file) {
        const fileName = file.name.toLowerCase();
        const extension = fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
        if (!ALLOWED_IMAGE_TYPES.includes(extension)) {
            return "Image must be a JPG, PNG, GIF or WEBP file.";
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return "Image must be 5 MB or smaller.";
        }
    }
    return "";
}

async function saveItem(event) {
    event.preventDefault(); // stop the browser from reloading the page

    const errorMessage = checkItemForm();
    if (errorMessage !== "") {
        showError(errorMessage);
        return;
    }

    // FormData sends the text fields and the image file in one request
    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("price", priceInput.value);
    formData.append("stockQuantity", stockInput.value);
    formData.append("categoryId", categorySelect.value);
    if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]); // without a new image the backend keeps the current one
    }

    setButtonLoading(saveButton, true, "Saving...");
    const result = editingItem === null
        ? await callApi("/items", "POST", formData)
        : await callApi("/items/" + editingItem.id, "PUT", formData);
    setButtonLoading(saveButton, false);

    if (showResult(result)) {
        formCard.hidden = true;
        loadItems();
    }
    window.scrollTo(0, 0); // the message is at the top of the page
}

// ---------- Assign Category ----------

function openAssignForm() {
    let options = `<option value="">-- Select an item --</option>`;
    for (const item of items) {
        options += `<option value="${item.id}">${escapeHtml(item.name)} (${escapeHtml(item.category.name)})</option>`;
    }
    assignItemSelect.innerHTML = options;
    assignCategorySelect.innerHTML = categoryOptions();

    formCard.hidden = true;
    assignCard.hidden = false;
    hideMessage(successBox);
    hideMessage(errorBox);
}

// When an item is chosen, start with its current category selected
function chooseAssignItem() {
    const item = findItem(assignItemSelect.value);
    assignCategorySelect.value = item ? String(item.category.id) : "";
}

async function saveAssignment(event) {
    event.preventDefault();
    if (assignItemSelect.value === "") {
        showError("Please select an item.");
        return;
    }

    setButtonLoading(assignSaveButton, true, "Saving...");
    const result = await callApi("/items/" + assignItemSelect.value + "/category", "PUT",
        { categoryId: assignCategorySelect.value });
    setButtonLoading(assignSaveButton, false);

    if (showResult(result)) {
        assignCard.hidden = true;
        loadItems();
    }
}

// ---------- View details ----------

function viewItem(item) {
    document.getElementById("item-view-title").textContent = item.name;
    setImage(document.getElementById("item-view-image"), itemImageUrl(item.imageName));
    document.getElementById("item-view-image").alt = item.name;
    document.getElementById("view-item-id").textContent = item.id;
    document.getElementById("view-item-name").textContent = item.name;
    document.getElementById("view-item-description").textContent = item.description || "No description";
    document.getElementById("view-item-category").textContent = item.category.name;
    document.getElementById("view-item-price").textContent = formatPrice(item.price);
    document.getElementById("view-item-stock").textContent = item.stockQuantity;
    document.getElementById("view-item-created").textContent = formatDate(item.createdAt);
    viewOverlay.hidden = false;
}

// ---------- Delete ----------

async function deleteItem(item) {
    // Ask first; if the admin clicks Cancel nothing is sent to the server
    if (!window.confirm('Delete the item "' + item.name + '"?')) {
        return;
    }
    const result = await callApi("/items/" + item.id, "DELETE");
    if (showResult(result)) {
        formCard.hidden = true;
        loadItems();
    }
    window.scrollTo(0, 0); // the message is at the top of the page
}
