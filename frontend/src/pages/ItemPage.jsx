import { useEffect, useState } from "react";
import { callApi, formatPrice, itemImageUrl, showPlaceholderImage } from "../api";

// For now only one sample item (Samba Rice, id 1) can be edited
const EDITABLE_ITEM_ID = 1;

// For now only one sample item (Nadu Rice, id 2) can be deleted
const DELETABLE_ITEM_ID = 2;

// Item Management: shows the items from the database (with images), lets the admin search them,
// add new items, move any item to another category, edit the Samba Rice sample item
// and delete the Nadu Rice sample item
function ItemPage({ onSessionExpired }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding a new item
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);       // image chosen by the admin (add only)
  const [imagePreview, setImagePreview] = useState("");   // what the form shows as the image

  // Assign Category form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignItemId, setAssignItemId] = useState("");
  const [assignCategoryId, setAssignCategoryId] = useState("");

  useEffect(() => {
    loadItems();
    callApi("/categories").then((result) => {
      if (result.ok) {
        setCategories(result.data);
      }
    });
  }, []);

  async function loadItems() {
    const result = await callApi("/items");
    if (result.ok) {
      setItems(result.data);
    } else if (result.status === 401) {
      onSessionExpired(result.data.message);
    } else {
      setErrorMessage(result.data.message);
    }
  }

  function showResult(result) {
    setSuccessMessage(result.ok ? result.data.message : "");
    setErrorMessage(result.ok ? "" : result.data.message);
  }

  // Opens the form; item is null when adding a new item
  function openForm(item) {
    setEditingItem(item);
    setName(item ? item.name : "");
    setDescription(item ? item.description || "" : "");
    setPrice(item ? String(item.price) : "");
    setStockQuantity(item ? String(item.stockQuantity) : "");
    setCategoryId(item ? String(item.category.id) : "");
    setImageFile(null);
    setImagePreview(itemImageUrl(item ? item.imageName : null));
    setShowAssignForm(false);
    setShowForm(true);
    setSuccessMessage("");
    setErrorMessage("");
    window.scrollTo(0, 0);
  }

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // show the chosen picture before uploading
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // FormData lets us send the text fields and the image file in one request
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stockQuantity", stockQuantity);
    formData.append("categoryId", categoryId);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = editingItem === null
      ? await callApi("/items", "POST", formData)
      : await callApi("/items/" + editingItem.id, "PUT", formData);

    if (result.status === 401) {
      onSessionExpired(result.data.message);
      return;
    }
    showResult(result);
    if (result.ok) {
      setShowForm(false);
      loadItems();
    }
  }

  function openAssignForm() {
    setAssignItemId("");
    setAssignCategoryId("");
    setShowForm(false);
    setShowAssignForm(true);
    setSuccessMessage("");
    setErrorMessage("");
  }

  // When an item is chosen, start with its current category selected
  function chooseAssignItem(itemId) {
    setAssignItemId(itemId);
    const item = items.find((i) => String(i.id) === itemId);
    setAssignCategoryId(item ? String(item.category.id) : "");
  }

  async function handleAssignSubmit(event) {
    event.preventDefault();
    if (assignItemId === "") {
      setSuccessMessage("");
      setErrorMessage("Please select an item.");
      return;
    }
    const result = await callApi("/items/" + assignItemId + "/category", "PUT", { categoryId: assignCategoryId });

    if (result.status === 401) {
      onSessionExpired(result.data.message);
      return;
    }
    showResult(result);
    if (result.ok) {
      setShowAssignForm(false);
      loadItems();
    }
  }

  async function handleDelete(item) {
    // Ask first; if the admin clicks Cancel nothing is sent to the server
    if (!window.confirm('Delete the item "' + item.name + '"?')) {
      return;
    }
    const result = await callApi("/items/" + item.id, "DELETE");

    if (result.status === 401) {
      onSessionExpired(result.data.message);
      return;
    }
    showResult(result);
    if (result.ok) {
      setShowForm(false);
      loadItems();
    }
  }

  // Search by name (done in the browser because all items are already loaded)
  const visibleItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="item-page">
      <div className="container">

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="item-heading">Item Management</h1>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn item-assign-button" onClick={openAssignForm}>Assign Category</button>
            <button type="button" className="btn item-add-button" onClick={() => openForm(null)}>+ Add New Item</button>
          </div>
        </div>

        {successMessage && <div className="alert alert-success item-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger item-error">{errorMessage}</div>}

        {/* ---------- Add / Edit form ---------- */}
        {showForm && (
          <div className="item-form-card">
            <h2 className="item-form-title">{editingItem === null ? "Add New Item" : "Edit Item"}</h2>
            {/* noValidate: all checks are done by the backend, so its clear messages are shown */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-4">
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label htmlFor="itemName" className="form-label item-label">Item Name</label>
                      <input type="text" id="itemName" className="form-control item-input" maxLength="100"
                             placeholder="e.g. Fresh Milk" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label htmlFor="itemCategory" className="form-label item-label">Category</label>
                      <select id="itemCategory" className="form-select item-select"
                              value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">-- Select a category --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label htmlFor="itemPrice" className="form-label item-label">Price (LKR)</label>
                      <input type="number" id="itemPrice" className="form-control item-input" step="0.01"
                             placeholder="e.g. 250.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label htmlFor="itemStock" className="form-label item-label">Stock Quantity</label>
                      <input type="number" id="itemStock" className="form-control item-input" step="1"
                             placeholder="e.g. 50" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label htmlFor="itemDescription" className="form-label item-label">Description</label>
                      <textarea id="itemDescription" className="form-control item-textarea" rows="3" maxLength="500"
                                placeholder="Short description of the item"
                                value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label htmlFor="itemImage" className="form-label item-label">Image</label>
                  <img src={imagePreview} alt="Item preview" className="item-form-image" onError={showPlaceholderImage} />
                  {editingItem === null && (
                    <>
                      <input type="file" id="itemImage" className="form-control item-file-input"
                             accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleImageChange} />
                      <p className="item-image-hint">JPG, PNG, GIF or WEBP, up to 5 MB. Optional.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn item-save-button">{editingItem === null ? "Add Item" : "Save Changes"}</button>
                <button type="button" className="btn item-cancel-button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ---------- Assign Category form ---------- */}
        {showAssignForm && (
          <div className="item-assign-card">
            <h2 className="item-assign-title">Assign Item to Category</h2>
            <form onSubmit={handleAssignSubmit} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="assignItem" className="form-label item-assign-label">Item</label>
                  <select id="assignItem" className="form-select item-assign-select"
                          value={assignItemId} onChange={(e) => chooseAssignItem(e.target.value)}>
                    <option value="">-- Select an item --</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name} ({item.category.name})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="assignCategory" className="form-label item-assign-label">New Category</label>
                  <select id="assignCategory" className="form-select item-assign-select"
                          value={assignCategoryId} onChange={(e) => setAssignCategoryId(e.target.value)}>
                    <option value="">-- Select a category --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="btn item-assign-save-button">Save Assignment</button>
                <button type="button" className="btn item-assign-cancel-button" onClick={() => setShowAssignForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

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
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="item-empty">
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
                      <td className="text-end text-nowrap">
                        {item.id === EDITABLE_ITEM_ID && (
                          <button type="button" className="btn item-edit-button" onClick={() => openForm(item)}>Edit</button>
                        )}
                        {item.id === DELETABLE_ITEM_ID && (
                          <button type="button" className="btn item-delete-button" onClick={() => handleDelete(item)}>Delete</button>
                        )}
                      </td>
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
