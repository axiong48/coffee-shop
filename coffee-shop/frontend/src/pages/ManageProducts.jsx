import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const emptyForm = { name: "", description: "", price: "", stock: "", image_url: "" };

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function loadProducts() {
    const data = await apiRequest("/admin/products");
    setProducts(data);
  }

  async function createProduct(e) {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/admin/products", {
        method: "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }),
      });
      setForm(emptyForm);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleProduct(product) {
    await apiRequest(`/admin/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    loadProducts();
  }

  async function deleteProduct(productId) {
    await apiRequest(`/admin/products/${productId}`, { method: "DELETE" });
    loadProducts();
  }

  useEffect(() => {
    loadProducts().catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Manage Products</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={createProduct} className="product-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <button>Add Product</button>
      </form>

      {products.map((product) => (
        <div className="row" key={product.id}>
          <div>
            <strong>{product.name}</strong>
            <p>${product.price.toFixed(2)} | Stock: {product.stock} | {product.is_active ? "Active" : "Inactive"}</p>
          </div>
          <button onClick={() => toggleProduct(product)}>Toggle Active</button>
          <button onClick={() => deleteProduct(product.id)}>Remove</button>
        </div>
      ))}
    </section>
  );
}
