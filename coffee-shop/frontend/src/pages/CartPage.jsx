import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function CartPage() {
  const { items, removeItem, updateQuantity, unitPrice, subtotal, clearCart, locationId } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const maxRedeemable = Math.min(user?.points_balance || 0, Math.floor(subtotal / 0.05));
  const discount = Math.min(redeemPoints * 0.05, subtotal);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    setError("");
    if (!items.length) return;
    if (!locationId) {
      setError("Please pick a location from the menu page first.");
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        location_id: locationId,
        redeem_points: redeemPoints,
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          customization_option_ids: i.selectedOptions.map((o) => o.id),
        })),
      };
      await api.post("/cart/checkout", payload);
      clearCart();
      await refreshUser();
      navigate("/orders");
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!items.length) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <button className="btn-primary" onClick={() => navigate("/menu")}>Browse menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {items.map((i) => (
          <div className="order-row" key={i.cartId}>
            <div>
              <strong>{i.menuItem.name}</strong>
              {i.selectedOptions.length > 0 && (
                <div className="muted">
                  {i.selectedOptions.map((o) => `${o.group_name}: ${o.choice_label}`).join(", ")}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => updateQuantity(i.cartId, Math.max(1, i.quantity - 1))}>−</button>
                <span>{i.quantity}</span>
                <button className="btn-secondary" onClick={() => updateQuantity(i.cartId, i.quantity + 1)}>+</button>
                <button className="btn-danger" onClick={() => removeItem(i.cartId)} style={{ marginLeft: 12 }}>
                  Remove
                </button>
              </div>
            </div>
            <span className="price-tag">${(unitPrice(i) * i.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Rewards points</h3>
        <p className="muted">You have {user?.points_balance || 0} points. 100 points = $5 off.</p>
        {maxRedeemable > 0 && (
          <div className="field" style={{ maxWidth: 220 }}>
            <label>Redeem points (in increments of 20)</label>
            <select value={redeemPoints} onChange={(e) => setRedeemPoints(Number(e.target.value))}>
              <option value={0}>None</option>
              {Array.from({ length: Math.floor(maxRedeemable / 20) }, (_, idx) => (idx + 1) * 20).map((p) => (
                <option key={p} value={p}>{p} pts (−${(p * 0.05).toFixed(2)})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="flex-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        {discount > 0 && (
          <div className="flex-between" style={{ color: "var(--success)" }}>
            <span>Points discount</span><span>−${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex-between" style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={handleCheckout}
          disabled={placing}
        >
          {placing ? "Placing order..." : "Place order"}
        </button>
      </div>
    </div>
  );
}
