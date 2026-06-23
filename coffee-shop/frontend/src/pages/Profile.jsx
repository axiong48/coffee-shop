import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/orders")
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      {error && <p className="error">{error}</p>}
      <h2>Order History</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map((order) => (
        <article className="card" key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ${order.total.toFixed(2)}</p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>{item.product_name} x {item.quantity}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
