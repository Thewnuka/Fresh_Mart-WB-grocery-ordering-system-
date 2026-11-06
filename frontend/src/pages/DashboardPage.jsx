import { useEffect, useState } from "react";
import { callApi, formatDate, formatPrice, itemImageUrl, showPlaceholderImage } from "../api";

// Admin Dashboard: statistics, quick navigation and recently added items
function DashboardPage({ admin, onNavigate, onLogout, onSessionExpired }) {
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the dashboard data from the backend when the page opens
  useEffect(() => {
    callApi("/dashboard").then((result) => {
      if (result.ok) {
        setDashboard(result.data);
      } else if (result.status === 401) {
        onSessionExpired(result.data.message);
      } else {
        setErrorMessage(result.data.message);
      }
    });
  }, []);

  return (
    <div className="dashboard-page">
      <div className="container">

        <div className="dashboard-header">
          <h1 className="dashboard-heading">Dashboard</h1>
          <p className="dashboard-welcome">Welcome back, {admin.fullName}!</p>
        </div>

        {errorMessage && <div className="alert alert-danger dashboard-error">{errorMessage}</div>}

        {/* ---------- Statistic cards (only shown once real data is loaded) ---------- */}
        {dashboard && (
          <div className="row g-4 mb-4">
            <div className="col-sm-6">
              <div className="dashboard-category-card">
                <p className="dashboard-category-label">Total Categories</p>
                <p className="dashboard-category-count">{dashboard.totalCategories}</p>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="dashboard-item-card">
                <p className="dashboard-item-label">Total Items</p>
                <p className="dashboard-item-count">{dashboard.totalItems}</p>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Quick navigation ---------- */}
        <div className="dashboard-quick-card">
          <h2 className="dashboard-quick-title">Quick Navigation</h2>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn dashboard-quick-categories" onClick={() => onNavigate("categories")}>
              Manage Categories
            </button>
            <button type="button" className="btn dashboard-quick-items" onClick={() => onNavigate("items")}>
              Manage Items
            </button>
            <button type="button" className="btn dashboard-quick-profile" onClick={() => onNavigate("profile")}>
              My Profile
            </button>
            <button type="button" className="btn dashboard-quick-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ---------- Recently added items ---------- */}
        {dashboard && (
          <div className="dashboard-recent-card">
            <h2 className="dashboard-recent-title">Recently Added Items</h2>

            <div className="table-responsive">
              <table className="table dashboard-recent-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Added On</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="dashboard-recent-empty">
                        No items have been added yet. New items will appear here.
                      </td>
                    </tr>
                  ) : (
                    dashboard.recentItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img src={itemImageUrl(item.imageName)} alt={item.name} className="dashboard-recent-image"
                               onError={showPlaceholderImage} />
                        </td>
                        <td>{item.name}</td>
                        <td className="text-nowrap">{item.category.name}</td>
                        <td className="text-nowrap">{formatPrice(item.price)}</td>
                        <td className="text-nowrap">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardPage;
