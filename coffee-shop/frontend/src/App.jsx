import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">Coffee Shop</Link>
        <Link to="/menu">Menu</Link>
        {user && <Link to="/cart">Cart</Link>}
        {user && <Link to="/checkout">Checkout</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user?.is_admin && <Link to="/admin/products">Manage Products</Link>}
        {user?.is_admin && <Link to="/admin/orders">View Orders</Link>}
        <span className="spacer" />
        {!user ? <Link to="/login">Login</Link> : <button onClick={logout}>Logout</button>}
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
