import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import CustomizeModal from "../components/CustomizeModal";

export default function MenuPage() {
  const [locations, setLocations] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const { locationId, setLocationId, addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get("/locations"), api.get("/menu")])
      .then(([locs, items]) => {
        setLocations(locs);
        setMenu(items);
        if (!locationId && locs.length) setLocationId(locs[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleAdd = (menuItem, quantity, selectedOptions) => {
    addItem(menuItem, quantity, selectedOptions);
    setAdded(`Added ${quantity}x ${menuItem.name} to cart`);
    setTimeout(() => setAdded(""), 2000);
  };

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h1>Menu</h1>
        <div style={{ width: 220 }}>
          <label>Pickup location</label>
          <select value={locationId || ""} onChange={(e) => setLocationId(Number(e.target.value))}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {added && <div className="success-banner">{added}</div>}

      <div className="grid">
        {menu.map((item) => (
          <div key={item.id} className={`card menu-item-card ${!item.available ? "unavailable" : ""}`}>
            <div>
              <h3>{item.name}</h3>
              <p className="desc">{item.description}</p>
            </div>
            <div className="flex-between">
              <span className="price-tag">${item.base_price.toFixed(2)}</span>
              <button
                className="btn-primary"
                disabled={!item.available}
                onClick={() => (item.customizations.length ? setActiveItem(item) : handleAdd(item, 1, []))}
              >
                {item.available ? "Add" : "Sold out"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeItem && (
        <CustomizeModal menuItem={activeItem} onClose={() => setActiveItem(null)} onAdd={handleAdd} />
      )}

      <div style={{ marginTop: 28, textAlign: "right" }}>
        <button className="btn-secondary" onClick={() => navigate("/cart")}>Go to cart →</button>
      </div>
    </div>
  );
}
