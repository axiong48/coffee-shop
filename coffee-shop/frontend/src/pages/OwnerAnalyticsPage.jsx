import { useEffect, useState } from "react";
import { api } from "../api";

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/owner/analytics").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="page"><div className="error-banner">{error}</div></div>;
  if (!data) return <div className="page">Loading...</div>;

  const maxRevenue = Math.max(1, ...data.revenue_by_location.map((r) => r.revenue));
  const maxQty = Math.max(1, ...data.top_items.map((i) => i.quantity_sold));

  return (
    <div className="page">
      <h1>Analytics</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Revenue</div>
          <div className="value">${data.total_revenue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{data.total_orders}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Revenue by Location</h3>
        {!data.revenue_by_location.length && <p className="muted">No orders yet.</p>}
        {data.revenue_by_location.map((r) => (
          <div key={r.location} style={{ marginBottom: 10 }}>
            <div className="flex-between muted"><span>{r.location}</span><span>${r.revenue.toFixed(2)}</span></div>
            <div style={{ background: "var(--cream)", borderRadius: 6, height: 8 }}>
              <div style={{
                width: `${(r.revenue / maxRevenue) * 100}%`,
                background: "var(--accent)",
                height: 8,
                borderRadius: 6,
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Top Selling Items</h3>
        {!data.top_items.length && <p className="muted">No orders yet.</p>}
        {data.top_items.map((i) => (
          <div key={i.name} style={{ marginBottom: 10 }}>
            <div className="flex-between muted"><span>{i.name}</span><span>{i.quantity_sold} sold</span></div>
            <div style={{ background: "var(--cream)", borderRadius: 6, height: 8 }}>
              <div style={{
                width: `${(i.quantity_sold / maxQty) * 100}%`,
                background: "var(--coffee)",
                height: 8,
                borderRadius: 6,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
