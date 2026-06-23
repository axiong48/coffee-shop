import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/admin/orders")
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>All Orders</h1>
      {error && <p className="error">{error}</p>}
      {orders.map((order) => (
        <article className="card" key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>Customer: {order.user.name} ({order.user.email})</p>
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
