import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <h1 style={{ fontSize: 40 }}>☕ One Stop Coffee Shop</h1>
      <p className="muted" style={{ fontSize: 16, marginBottom: 28 }}>
        Order ahead, skip the line, earn rewards.
      </p>
      {!user && (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/signup"><button className="btn-primary">Sign up</button></Link>
          <Link to="/login"><button className="btn-secondary">Log in</button></Link>
        </div>
      )}
      {user?.role === "customer" && (
        <Link to="/menu"><button className="btn-primary">Browse menu</button></Link>
      )}
      {user?.role === "barista" && (
        <Link to="/barista/queue"><button className="btn-primary">View order queue</button></Link>
      )}
      {user?.role === "owner" && (
        <Link to="/owner/menu"><button className="btn-primary">Manage menu</button></Link>
      )}
    </div>
  );
}
