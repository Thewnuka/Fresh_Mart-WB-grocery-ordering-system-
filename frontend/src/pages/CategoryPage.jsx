import { useEffect, useState } from "react";
import { callApi } from "../api";

// Category Management: shows the categories from the database, lets the admin search them
// and add new categories
function CategoryPage({ onSessionExpired }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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

  function openAddForm() {
    setName("");
    setDescription("");
    setShowForm(true);
    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await callApi("/categories", "POST", { name, description });

    if (result.status === 401) {
      onSessionExpired(result.data.message);
      return;
    }
    setSuccessMessage(result.ok ? result.data.message : "");
    setErrorMessage(result.ok ? "" : result.data.message);
    if (result.ok) {
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
          <button type="button" className="btn category-add-button" onClick={openAddForm}>+ Add New Category</button>
        </div>

        {successMessage && <div className="alert alert-success category-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger category-error">{errorMessage}</div>}

        {/* ---------- Add form ---------- */}
        {showForm && (
          <div className="category-form-card">
            <h2 className="category-form-title">Add New Category</h2>
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
              <button type="submit" className="btn category-save-button">Add Category</button>
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
                </tr>
              </thead>
              <tbody>
                {visibleCategories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="category-empty">
                      {categories.length === 0 ? "No categories have been added yet." : "No categories found."}
                    </td>
                  </tr>
                ) : (
                  visibleCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className="category-name-cell">{category.name}</td>
                      <td>{category.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CategoryPage;
