import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function CartPage() {
  const { items, removeItem, unitPrice, subtotal, clearCart, locationId } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const promoDiscount = promoCode === "GRANDOPENING" ? subtotal * 0.15 : 0;
  const subtotalAfterPromo = subtotal - promoDiscount;
  const maxRedeemable = Math.min(user?.points_balance || 0, Math.floor(subtotalAfterPromo / 0.05));
  const validRedeemPoints = Math.min(redeemPoints, maxRedeemable);
  const pointsDiscount = validRedeemPoints * 0.05;
  const total = Math.max(0, subtotal - promoDiscount - pointsDiscount);

  useEffect(() => {
    if (redeemPoints > maxRedeemable) setRedeemPoints(Math.floor(maxRedeemable / 20) * 20);
  }, [maxRedeemable, redeemPoints]);

  const handleCheckout = async () => {
    setError("");
    if (!items.length) return;
    if (!locationId) {
      setError("Please pick a location from the menu page first.");
      return;
    }
    setPlacing(true);
    try {
      await api.post("/cart/checkout", {
        location_id: locationId,
        redeem_points: validRedeemPoints,
        promo_code: promoCode,
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          customization_option_ids: i.selectedOptions.map((o) => o.id),
        })),
      });
      clearCart();
      await refreshUser();
      navigate("/orders");
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <h1>Cart</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {items.map((item) => (
          <div key={item.cartId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItem.name}</div>
              <div className="muted" style={{ fontSize: 14 }}>{item.selectedOptions.map((o) => o.choice_label).join(", ")}</div>
              <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => removeItem(item.cartId)}>Remove</button>
            </div>
            <div style={{ fontWeight: 600 }}>${(unitPrice(item) * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Rewards</h3>
        <p className="muted">You have {user?.points_balance || 0} points.</p>
        <select value={validRedeemPoints} onChange={(e) => setRedeemPoints(Number(e.target.value))}>
          <option value={0}>None</option>
          {Array.from({ length: Math.floor(maxRedeemable / 20) }, (_, idx) => (idx + 1) * 20).map((p) => (
            <option key={p} value={p}>{p} pts (−${(p * 0.05).toFixed(2)})</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <label>Promo Code</label>
        <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter code" />
        
        <div style={{ marginTop: 16 }}>
          <div className="flex-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          {promoDiscount > 0 && <div className="flex-between" style={{ color: "var(--success)" }}><span>Promo discount</span><span>−${promoDiscount.toFixed(2)}</span></div>}
          {pointsDiscount > 0 && <div className="flex-between" style={{ color: "var(--success)" }}><span>Points discount</span><span>−${pointsDiscount.toFixed(2)}</span></div>}
          <div className="flex-between" style={{ marginTop: 12, fontSize: 18, fontWeight: 700 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} disabled={placing} onClick={handleCheckout}>
          {placing ? "Placing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
