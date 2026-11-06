import { useEffect, useState } from "react";
import { callApi, formatPrice, itemImageUrl, showPlaceholderImage } from "../api";

// Item Management: shows the items from the database (with images) and lets the admin search them
function ItemPage({ onSessionExpired }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load the items when the page opens
  useEffect(() => {
    callApi("/items").then((result) => {
      if (result.ok) {
        setItems(result.data);
      } else if (result.status === 401) {
        onSessionExpired(result.data.message);
      } else {
        setErrorMessage(result.data.message);
      }
    });
  }, []);

  // Search by name (done in the browser because all items are already loaded)
  const visibleItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="item-page">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="item-heading">Item Management</h1>
        </div>

        {errorMessage && <div className="alert alert-danger item-error">{errorMessage}</div>}

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
                      <td>
                        <img src={itemImageUrl(item.imageName)} alt={item.name} className="item-table-image"
                             onError={showPlaceholderImage} />
                      </td>
                      <td>{item.id}</td>
                      <td>
                        <div className="item-name-text">{item.name}</div>
                        <div className="item-description-text">{item.description}</div>
                      </td>
                      <td className="text-nowrap">{item.category.name}</td>
                      <td className="text-nowrap">{formatPrice(item.price)}</td>
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
