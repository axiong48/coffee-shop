import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_FLOW = ["pending", "in_progress", "ready", "picked_up"];
const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
};
const NEXT_LABEL = {
  pending: "Start preparing",
  in_progress: "Mark ready",
  ready: "Mark picked up",
};

export default function BaristaQueuePage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => {
    const query = statusFilter ? `?status=${statusFilter}` : "";
    api.get(`/orders${query}`).then(setOrders).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const advanceStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    try {
      await api.patch(`/orders/${order.id}/status`, { status: next });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page">
      <h1>Order Queue</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="tab-row">
        {["", "pending", "in_progress", "ready", "picked_up"].map((s) => (
          <button
            key={s || "all"}
            className={statusFilter === s ? "active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {s ? STATUS_LABELS[s] : "All"}
          </button>
        ))}
      </div>

      {!orders.length && <div className="empty-state">No orders here right now.</div>}

      {orders.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 14 }}>
          <div className="flex-between">
            <div>
              <strong>Order #{o.id}</strong> — {o.customer_name}
              <div className="muted">{o.location_name} · {new Date(o.created_at).toLocaleString()}</div>
            </div>
            <span className={`badge ${o.status}`}>{STATUS_LABELS[o.status]}</span>
          </div>

          <div style={{ marginTop: 10 }}>
            {o.items.map((it) => (
              <div className="muted" key={it.id}>
                {it.quantity}x {it.menu_item_name}
                {it.customizations.length > 0 ? ` (${it.customizations.join(", ")})` : ""}
              </div>
            ))}
          </div>

          {NEXT_LABEL[o.status] && (
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => advanceStatus(o)}>
              {NEXT_LABEL[o.status]}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
