import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Menu() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  async function loadProducts() {
    const data = await apiRequest("/products");
    setProducts(data);
  }

  async function addToCart(productId) {
    setError("");
    try {
      await apiRequest("/cart/add", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      alert("Added to cart");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProducts().catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Menu</h1>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {products.map((product) => (
          <article className="card" key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>${product.price.toFixed(2)}</strong></p>
            <p>Stock: {product.stock}</p>
            {user ? <button onClick={() => addToCart(product.id)}>Add to Cart</button> : <p>Login to add to cart.</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
