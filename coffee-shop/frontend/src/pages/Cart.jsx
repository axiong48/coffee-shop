import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  async function loadCart() {
    const data = await apiRequest("/cart");
    setCart(data);
  }

  async function updateItem(itemId, quantity) {
    const data = await apiRequest(`/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
  }

  async function removeItem(itemId) {
    const data = await apiRequest(`/cart/${itemId}`, { method: "DELETE" });
    setCart(data);
  }

  useEffect(() => {
    loadCart().catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Shopping Cart</h1>
      {error && <p className="error">{error}</p>}
      {cart.items.length === 0 ? <p>Your cart is empty.</p> : null}
      {cart.items.map((item) => (
        <div className="row" key={item.id}>
          <div>
            <strong>{item.product.name}</strong>
            <p>${item.product.price.toFixed(2)} each</p>
          </div>
          <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, Number(e.target.value))} />
          <strong>${item.line_total.toFixed(2)}</strong>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <h2>Total: ${cart.total.toFixed(2)}</h2>
      {cart.items.length > 0 && <Link className="button" to="/checkout">Go to Checkout</Link>}
    </section>
  );
}
