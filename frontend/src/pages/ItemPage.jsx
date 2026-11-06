import { useState } from "react";

// Item Management: shows the list of items and lets the admin search it.
// The item table is not in the database yet, so the list is still empty.
function ItemPage() {
  const items = []; // will be loaded from the database once items exist
  const [search, setSearch] = useState("");

  // Search by name (done in the browser)
  const visibleItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="item-page">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="item-heading">Item Management</h1>
        </div>

        {/* ---------- Item list ---------- */}
        <div className="item-table-card">
          <div className="row g-2 mb-3">
            <div className="col-md-8">
              <input type="text" className="form-control item-search" placeholder="Search items by name..."
                     value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table item-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="item-empty">
                      {items.length === 0 ? "No items have been added yet." : "No items found."}
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((item) => (
                    <tr key={item.id}>
                      <td>{/* item image is added together with the item data */}</td>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.categoryName}</td>
                      <td>{item.price}</td>
                      <td>{item.stockQuantity}</td>
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

export default ItemPage;
