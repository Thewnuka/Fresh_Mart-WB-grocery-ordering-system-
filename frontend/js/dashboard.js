// Admin Dashboard: statistics, quick navigation and recently added items
import { callApi, itemImageUrl } from "./api.js";
import { requireLogin, setupNavbar, logout, goToLogin, showMessage, escapeHtml, formatDate, formatPrice } from "./common.js";

startPage();

async function startPage() {
    const admin = await requireLogin(); // opens the Login page if nobody is logged in
    if (admin === null) {
        return;
    }
    setupNavbar(admin);
    document.getElementById("dashboard-admin-name").textContent = admin.fullName;
    document.getElementById("dashboard-logout-button").addEventListener("click", logout);
    loadDashboard();
}

// Loads { totalCategories, totalItems, recentItems } from the backend and shows them
async function loadDashboard() {
    const result = await callApi("/dashboard");
    document.getElementById("dashboard-loading").hidden = true;

    if (result.status === 401) {
        goToLogin(result.data.message); // the session has expired
        return;
    }
    if (!result.ok) {
        showMessage(document.getElementById("dashboard-error"), result.data.message);
        return;
    }

    const dashboard = result.data;
    document.getElementById("total-categories").textContent = dashboard.totalCategories;
    document.getElementById("total-items").textContent = dashboard.totalItems;
    document.getElementById("dashboard-stats").hidden = false;

    showRecentItems(dashboard.recentItems);
    document.getElementById("dashboard-recent").hidden = false;
}

// Fills the "Recently Added Items" table
function showRecentItems(items) {
    const tableBody = document.getElementById("recent-items-body");

    if (items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="dashboard-recent-empty">
                    No items have been added yet. New items will appear here.
                </td>
            </tr>`;
        return;
    }

    let rows = "";
    for (const item of items) {
        // onerror shows the "No Image" placeholder if the image file cannot be loaded
        rows += `
            <tr>
                <td>
                    <img src="${escapeHtml(itemImageUrl(item.imageName))}" alt="${escapeHtml(item.name)}" class="dashboard-recent-image"
                         onerror="this.onerror = null; this.src = '/no-image.svg';">
                </td>
                <td>${escapeHtml(item.name)}</td>
                <td class="text-nowrap">${escapeHtml(item.category.name)}</td>
                <td class="text-nowrap">${formatPrice(item.price)}</td>
                <td class="text-nowrap">${formatDate(item.createdAt)}</td>
            </tr>`;
    }
    tableBody.innerHTML = rows;
}
