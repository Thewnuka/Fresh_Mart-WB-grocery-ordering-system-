import { useEffect, useState } from "react";
import { callApi } from "../api";

// Category Management: shows the categories from the database and lets the admin search them
function CategoryPage({ onSessionExpired }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load the categories when the page opens
  useEffect(() => {
    callApi("/categories").then((result) => {
      if (result.ok) {
        setCategories(result.data);
      } else if (result.status === 401) {
        onSessionExpired(result.data.message);
      } else {
        setErrorMessage(result.data.message);
      }
    });
  }, []);

  // Search by name (done in the browser because all categories are already loaded)
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="category-page">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="category-heading">Category Management</h1>
        </div>

        {errorMessage && <div className="alert alert-danger category-error">{errorMessage}</div>}

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
