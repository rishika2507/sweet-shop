import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminPanel() {
  const [sweets, setSweets] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity_in_stock: 0,
  });
  const [error, setError] = useState("");

  const loadSweets = async () => {
    try {
      const response = await api.get("sweets/");
      setSweets(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load sweets.");
    }
  };

  useEffect(() => {
    loadSweets();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("sweets/", form);
      setForm({ name: "", category: "", price: "", quantity_in_stock: 0 });
      await loadSweets();
    } catch (err) {
      setError("Create failed (only admin can create).");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sweet?")) return;
    try {
      await api.delete(`sweets/${id}/`);
      await loadSweets();
    } catch (err) {
      alert("Delete failed (only admin).");
    }
  };

  const handleRestock = async (id) => {
    const qty = window.prompt("Restock quantity:", "5");
    if (!qty) return;
    try {
      await api.post(`sweets/${id}/restock`, { quantity: Number(qty) });
      await loadSweets();
    } catch (err) {
      alert("Restock failed (only admin).");
    }
  };

  // NEW: total stock value = sum(price * quantity)
  const totalValue = sweets.reduce((sum, sweet) => {
    const price = parseFloat(sweet.price);
    const qty = sweet.quantity_in_stock;
    if (!isNaN(price) && !isNaN(qty)) {
      return sum + price * qty;
    }
    return sum;
  }, 0);

  return (
    <>
      <aside className="sidebar">
        <div>
          <div className="sidebar-section-title">Admin actions</div>
          <div className="sidebar-link">Create / edit sweets</div>
          <div className="sidebar-link">Restock inventory</div>
          <div className="sidebar-link">Delete items</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div className="sidebar-section-title">Stats</div>
          <div className="sidebar-chip">
            Total items: {sweets.length}
          </div>
          <div className="sidebar-chip">
            Stock value: ₹{totalValue.toFixed(2)}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <h2 className="section-title">Admin panel</h2>
        {error && <p className="error-text">{error}</p>}

        <div className="form-card">
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Create sweet</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <input
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              <input
                placeholder="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Price"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
              <input
                placeholder="Quantity"
                name="quantity_in_stock"
                type="number"
                value={form.quantity_in_stock}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="button-primary">
              Create
            </button>
          </form>
        </div>

        <h3 style={{ marginTop: 24, marginBottom: 10 }}>Existing sweets</h3>
        <div className="card-grid">
          {sweets.map((sweet) => (
            <div key={sweet.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge">{sweet.category}</span>
                <h3>{sweet.name}</h3>
                <p className="price-tag">₹{sweet.price}</p>
                <p>In stock: {sweet.quantity_in_stock}</p>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  className="button-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleRestock(sweet.id)}
                >
                  Restock
                </button>
                <button
                  className="button-primary"
                  style={{
                    flex: 1,
                    background: "#ef4444",
                    backgroundImage: "none",
                  }}
                  onClick={() => handleDelete(sweet.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default AdminPanel;
