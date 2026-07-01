import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/orders/me").then(setOrders).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    // Poll for status changes so a customer sees "Ready" update without refreshing
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="page"><div className="error-banner">{error}</div></div>;

  if (!orders.length) {
    return (
      <div className="page">
        <h1>My Orders</h1>
        <div className="empty-state">You haven't placed any orders yet.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Orders</h1>
      {orders.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 14 }}>
          <div className="flex-between">
            <div>
              <strong>Order #{o.id}</strong>
              <div className="muted">{o.location_name} · {new Date(o.created_at).toLocaleString()}</div>
            </div>
            <span className={`badge ${o.status}`}>{STATUS_LABELS[o.status]}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            {o.items.map((it) => (
              <div className="order-row" key={it.id}>
                <div>
                  {it.quantity}x {it.menu_item_name}
                  {it.customizations.length > 0 && (
                    <div className="muted">{it.customizations.join(", ")}</div>
                  )}
                </div>
                <span>${(it.price_at_purchase * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex-between" style={{ marginTop: 10, fontWeight: 700 }}>
            <span>Total</span>
            <span>${o.total.toFixed(2)}</span>
          </div>
          {(o.points_earned > 0 || o.points_redeemed > 0) && (
            <div className="muted" style={{ marginTop: 4 }}>
              {o.points_redeemed > 0 && `Redeemed ${o.points_redeemed} pts · `}
              Earned {o.points_earned} pts
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
