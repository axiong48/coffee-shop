import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Checkout() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function placeOrder() {
    setError("");
    try {
      await apiRequest("/orders/checkout", { method: "POST" });
      alert("Order placed. No payment connected yet.");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Checkout</h1>
      <p>This checkout creates an order without payment for now.</p>
      {error && <p className="error">{error}</p>}
      <button onClick={placeOrder}>Place Order</button>
    </section>
  );
}
