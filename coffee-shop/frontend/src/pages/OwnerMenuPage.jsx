import { useEffect, useState } from "react";
import { api } from "../api";

export default function OwnerMenuPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({ name: "", description: "", base_price: "", category: "drink" });
  const [expandedId, setExpandedId] = useState(null);
  const [newOption, setNewOption] = useState({ group_name: "", choice_label: "", price_delta: "" });

  const load = () => api.get("/owner/menu").then(setItems).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/owner/menu", { ...newItem, base_price: parseFloat(newItem.base_price) });
      setNewItem({ name: "", description: "", base_price: "", category: "drink" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleAvailable = async (item) => {
    await api.patch(`/owner/menu/${item.id}`, { available: !item.available });
    load();
  };

  const updatePrice = async (item, price) => {
    await api.patch(`/owner/menu/${item.id}`, { base_price: parseFloat(price) });
    load();
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    await api.delete(`/owner/menu/${item.id}`);
    load();
  };

  const handleAddOption = async (itemId) => {
    if (!newOption.group_name || !newOption.choice_label) return;
    try {
      await api.post(`/owner/menu/${itemId}/customizations`, {
        ...newOption,
        price_delta: parseFloat(newOption.price_delta || 0),
      });
      setNewOption({ group_name: "", choice_label: "", price_delta: "" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteOption = async (optionId) => {
    await api.delete(`/owner/customizations/${optionId}`);
    load();
  };

  return (
    <div className="page">
      <h1>Menu Management</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add new item</h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Name</label>
            <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Description</label>
            <input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Price</label>
            <input type="number" step="0.01" value={newItem.base_price} onChange={(e) => setNewItem({ ...newItem, base_price: e.target.value })} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Category</label>
            <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
              <option value="drink">Drink</option>
              <option value="food">Food</option>
            </select>
          </div>
          <button className="btn-primary" type="submit">Add</button>
        </form>
      </div>

      <div className="grid">
        {items.map((item) => (
          <div className="card" key={item.id}>
            <div className="flex-between">
              <h3>{item.name}</h3>
              <button className="btn-secondary" onClick={() => toggleAvailable(item)}>
                {item.available ? "Available" : "Sold out"}
              </button>
            </div>
            <p className="muted">{item.description}</p>

            <div className="field">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                defaultValue={item.base_price}
                onBlur={(e) => updatePrice(item, e.target.value)}
              />
            </div>

            <button
              className="btn-secondary"
              style={{ width: "100%" }}
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              {expandedId === item.id ? "Hide customizations" : `Customizations (${item.customizations.length})`}
            </button>

            {expandedId === item.id && (
              <div style={{ marginTop: 12 }}>
                {item.customizations.map((opt) => (
                  <div className="flex-between" key={opt.id} style={{ marginBottom: 6 }}>
                    <span className="muted">{opt.group_name}: {opt.choice_label} (+${opt.price_delta.toFixed(2)})</span>
                    <button className="btn-danger" onClick={() => handleDeleteOption(opt.id)}>Remove</button>
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 70px auto", gap: 6, marginTop: 10 }}>
                  <input placeholder="Group (Size)" value={newOption.group_name}
                    onChange={(e) => setNewOption({ ...newOption, group_name: e.target.value })} />
                  <input placeholder="Choice (Large)" value={newOption.choice_label}
                    onChange={(e) => setNewOption({ ...newOption, choice_label: e.target.value })} />
                  <input placeholder="+$" type="number" step="0.01" value={newOption.price_delta}
                    onChange={(e) => setNewOption({ ...newOption, price_delta: e.target.value })} />
                  <button className="btn-primary" onClick={() => handleAddOption(item.id)}>Add</button>
                </div>
              </div>
            )}

            <button className="btn-danger" style={{ width: "100%", marginTop: 12 }} onClick={() => handleDelete(item)}>
              Delete item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
