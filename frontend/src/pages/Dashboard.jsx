import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [error, setError] = useState("");

  // Search + filters
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  // NEW: cart + message
  const [cartCount, setCartCount] = useState(0);
  const [message, setMessage] = useState("");

  const getPricesFromRange = (range) => {
    if (range === "under50") return { maxPrice: 50 };
    if (range === "under100") return { maxPrice: 100 };
    return {};
  };

  const loadSweets = async (params = {}) => {
    try {
      let url = "sweets/";
      const query = new URLSearchParams();

      if (params.name) query.append("name", params.name);
      if (params.category && params.category !== "all") {
        query.append("category", params.category);
      }
      if (params.minPrice) query.append("minPrice", params.minPrice);
      if (params.maxPrice) query.append("maxPrice", params.maxPrice);

      if ([...query].length > 0) {
        url = "sweets/search?" + query.toString();
      }

      const response = await api.get(url);
      setSweets(response.data);
      setError("");
    } catch (err) {
      setError("Failed to load sweets. Try logging in again.");
      setSweets([]);
    }
  };

  useEffect(() => {
    loadSweets();
  }, []);

  const handlePurchase = async (id) => {
    try {
      await api.post(`sweets/${id}/purchase`, { quantity: 1 });
      setCartCount((prev) => prev + 1);
      setMessage("Purchase successful!");
      setTimeout(() => setMessage(""), 2000);

      await loadSweets({
        name: searchName,
        category: selectedCategory,
        ...getPricesFromRange(priceRange),
      });
    } catch (err) {
      alert("Purchase failed");
    }
  };

  const handleSearch = () => {
    loadSweets({
      name: searchName,
      category: selectedCategory,
      ...getPricesFromRange(priceRange),
    });
  };

  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(categoryKey);
    loadSweets({
      name: searchName,
      category: categoryKey,
      ...getPricesFromRange(priceRange),
    });
  };

  const handlePriceClick = (rangeKey) => {
    setPriceRange(rangeKey);
    loadSweets({
      name: searchName,
      category: selectedCategory,
      ...getPricesFromRange(rangeKey),
    });
  };

  // Simple bestseller rule: quantity >= 40 is bestseller
  const isBestseller = (sweet) => sweet.quantity_in_stock >= 40;

  return (
    <>
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-section-title">Categories</div>
          <div
            className="sidebar-link"
            style={{ fontWeight: selectedCategory === "all" ? "700" : "400" }}
            onClick={() => handleCategoryClick("all")}
          >
            All sweets
          </div>
          <div
            className="sidebar-link"
            style={{ fontWeight: selectedCategory === "Cupcakes" ? "700" : "400" }}
            onClick={() => handleCategoryClick("Cupcakes")}
          >
            Cupcakes
          </div>
          <div
            className="sidebar-link"
            style={{
              fontWeight: selectedCategory === "Indian Sweet" ? "700" : "400",
            }}
            onClick={() => handleCategoryClick("Indian Sweet")}
          >
            Indian sweets
          </div>
          <div
            className="sidebar-link"
            style={{ fontWeight: selectedCategory === "Macarons" ? "700" : "400" }}
            onClick={() => handleCategoryClick("Macarons")}
          >
            Macarons
          </div>
          <div
            className="sidebar-link"
            style={{
              fontWeight: selectedCategory === "Cakes" ? "700" : "400",
            }}
            onClick={() => handleCategoryClick("Cakes")}
          >
            Cakes
          </div>
          <div
            className="sidebar-link"
            style={{
              fontWeight: selectedCategory === "Chocolates" ? "700" : "400",
            }}
            onClick={() => handleCategoryClick("Chocolates")}
          >
            Chocolates
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="sidebar-section-title">Filters</div>
          <div
            className="sidebar-chip"
            style={{ fontWeight: priceRange === "all" ? "700" : "400" }}
            onClick={() => handlePriceClick("all")}
          >
            Any price
          </div>
          <div
            className="sidebar-chip"
            style={{ fontWeight: priceRange === "under50" ? "700" : "400" }}
            onClick={() => handlePriceClick("under50")}
          >
            Under ₹50
          </div>
          <div
            className="sidebar-chip"
            style={{ fontWeight: priceRange === "under100" ? "700" : "400" }}
            onClick={() => handlePriceClick("under100")}
          >
            Under ₹100
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="main-content">
        <div className="section-header">
          <div className="section-title">Featured products</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {sweets.length} items • Cart: {cartCount}
          </div>
        </div>

        {/* Search bar */}
        <div
          style={{
            marginBottom: 11,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search sweets by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <button
            className="button-primary"
            style={{ fontSize: 12 }}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {message && (
          <p style={{ color: "#15803d", fontSize: 12, marginBottom: 6 }}>
            {message}
          </p>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="card-grid">
          {sweets.map((sweet) => (
            <div key={sweet.id} className="card">
              <span className="badge">
                {sweet.category}
                {isBestseller(sweet) ? " • Bestseller" : ""}
              </span>
              <h3>{sweet.name}</h3>
              <p className="price-tag">₹{sweet.price}</p>
              <p>
                In stock: {sweet.quantity_in_stock}{" "}
                {sweet.quantity_in_stock <= 5 && (
                  <span style={{ color: "#b91c1c", fontWeight: 600 }}>
                    • Low stock
                  </span>
                )}
              </p>
              <button
                className="button-primary"
                onClick={() => handlePurchase(sweet.id)}
                disabled={sweet.quantity_in_stock === 0}
              >
                {sweet.quantity_in_stock === 0 ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          ))}
        </div>

      </main>
    </>
  );
}

export default Dashboard;
