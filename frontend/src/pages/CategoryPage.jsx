import { useEffect, useState } from "react";
import { callApi, formatDate } from "../api";

// Category Management: view, search, add, edit and delete categories
function CategoryPage({ onSessionExpired }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = adding a new category
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // View details window
  const [viewedCategory, setViewedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const result = await callApi("/categories");
    if (result.ok) {
      setCategories(result.data);
    } else if (result.status === 401) {
      onSessionExpired(result.data.message);
    } else {
      setErrorMessage(result.data.message);
    }
  }

  // Shows the result of a save or delete; returns true when it worked
  function showResult(result) {
    if (result.status === 401) {
      onSessionExpired(result.data.message);
      return false;
    }
    setSuccessMessage(result.ok ? result.data.message : "");
    setErrorMessage(result.ok ? "" : result.data.message);
    return result.ok;
  }

  // Opens the form; category is null when adding a new category
  function openForm(category) {
    setEditingCategory(category);
    setName(category ? category.name : "");
    setDescription(category ? category.description || "" : "");
    setShowForm(true);
    setSuccessMessage("");
    setErrorMessage("");
    window.scrollTo(0, 0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const body = { name, description };
    const result = editingCategory === null
      ? await callApi("/categories", "POST", body)
      : await callApi("/categories/" + editingCategory.id, "PUT", body);

    if (showResult(result)) {
      setShowForm(false);
      loadCategories();
    }
  }

  // Loads the details (including the number of items) from the backend
  async function handleView(category) {
    const result = await callApi("/categories/" + category.id);
    if (result.ok) {
      setViewedCategory(result.data);
    } else {
      showResult(result);
    }
  }

  async function handleDelete(category) {
    // Ask first; if the admin clicks Cancel nothing is sent to the server
    if (!window.confirm('Delete the category "' + category.name + '"?')) {
      return;
    }
    const result = await callApi("/categories/" + category.id, "DELETE");
    if (showResult(result)) {
      setShowForm(false);
      loadCategories();
    }
  }

  // Search by name (done in the browser because all categories are already loaded)
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="category-page">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="category-heading">Category Management</h1>
          <button type="button" className="btn category-add-button" onClick={() => openForm(null)}>+ Add New Category</button>
        </div>

        {successMessage && <div className="alert alert-success category-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger category-error">{errorMessage}</div>}

        {/* ---------- Add / Edit form ---------- */}
        {showForm && (
          <div className="category-form-card">
            <h2 className="category-form-title">{editingCategory === null ? "Add New Category" : "Edit Category"}</h2>
            {/* noValidate: all checks are done by the backend, so its clear messages are shown */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="categoryName" className="form-label category-label">Category Name</label>
                <input type="text" id="categoryName" className="form-control category-input" maxLength="100"
                       placeholder="e.g. Dairy Products" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label htmlFor="categoryDescription" className="form-label category-label">Description</label>
                <textarea id="categoryDescription" className="form-control category-textarea" rows="3" maxLength="255"
                          placeholder="Short description of this category"
                          value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <button type="submit" className="btn category-save-button">
                {editingCategory === null ? "Add Category" : "Save Changes"}
              </button>
              <button type="button" className="btn category-cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        )}

        {/* ---------- Category list ---------- */}
        <div className="category-table-card">
          <input type="text" className="form-control category-search" placeholder="Search categories by name..."
                 value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="table-responsive">
            <table className="table category-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="category-empty">
                      {categories.length === 0 ? "No categories have been added yet." : "No categories found."}
                    </td>
                  </tr>
                ) : (
                  visibleCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className="category-name-cell">{category.name}</td>
                      <td>{category.description}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn category-view-button" onClick={() => handleView(category)}>View</button>
                        <button type="button" className="btn category-edit-button" onClick={() => openForm(category)}>Edit</button>
                        <button type="button" className="btn category-delete-button" onClick={() => handleDelete(category)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------- View details window ---------- */}
        {viewedCategory && (
          <div className="category-view-overlay" onClick={() => setViewedCategory(null)}>
            <div className="category-view-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="category-view-title">{viewedCategory.name}</h2>
              <dl className="category-view-details">
                <dt>Category ID</dt><dd>{viewedCategory.id}</dd>
                <dt>Name</dt><dd>{viewedCategory.name}</dd>
                <dt>Description</dt><dd>{viewedCategory.description || "No description"}</dd>
                <dt>Items in this category</dt><dd>{viewedCategory.itemCount}</dd>
                <dt>Created</dt><dd>{formatDate(viewedCategory.createdAt)}</dd>
              </dl>
              <button type="button" className="btn category-view-close-button" onClick={() => setViewedCategory(null)}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CategoryPage;
