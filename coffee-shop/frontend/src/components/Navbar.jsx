import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <NavLink to="/" className="brand">☕ One Stop Coffee Shop</NavLink>
      <nav>
        {!user && (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup">Sign up</NavLink>
          </>
        )}

        {user?.role === "customer" && (
          <>
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/orders">My Orders</NavLink>
          </>
        )}

        {user?.role === "barista" && <NavLink to="/barista/queue">Order Queue</NavLink>}

        {user?.role === "owner" && (
          <>
            <NavLink to="/owner/menu">Menu</NavLink>
            <NavLink to="/owner/locations">Locations</NavLink>
            <NavLink to="/owner/analytics">Analytics</NavLink>
            <NavLink to="/barista/queue">Order Queue</NavLink>
          </>
        )}

        {user && (
          <>
            <span className="user-pill">
              {user.name} · {user.role}
              {user.role === "customer" ? ` · ${user.points_balance} pts` : ""}
            </span>
            <button onClick={handleLogout}>Log out</button>
          </>
        )}
      </nav>
    </div>
  );
}
