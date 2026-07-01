import { useEffect, useState } from "react";
import { api } from "../api";

export default function OwnerLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: "", address: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/locations").then(setLocations).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/owner/locations", form);
      setForm({ name: "", address: "" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (loc) => {
    if (!confirm(`Delete ${loc.name}? This will fail if it has existing orders.`)) return;
    try {
      await api.delete(`/owner/locations/${loc.id}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page">
      <h1>Locations</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add new location</h3>
        <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <button className="btn-primary" type="submit">Add</button>
        </form>
      </div>

      <table className="card">
        <thead>
          <tr><th>Name</th><th>Address</th><th></th></tr>
        </thead>
        <tbody>
          {locations.map((l) => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.address}</td>
              <td><button className="btn-danger" onClick={() => handleDelete(l)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
