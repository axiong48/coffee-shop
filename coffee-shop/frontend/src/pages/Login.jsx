import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role, navigate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h2>Welcome back</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Log in to order or manage the shop.</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16 }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>

        <div className="muted" style={{ marginTop: 20, fontSize: 12, lineHeight: 1.6 }}>
          Demo accounts:<br />
          owner@coffee.com / owner123<br />
          barista@coffee.com / barista123<br />
          customer@coffee.com / customer123
        </div>
      </div>
    </div>
  );
}

export function redirectByRole(role, navigate) {
  if (role === "owner") navigate("/owner/menu");
  else if (role === "barista") navigate("/barista/queue");
  else navigate("/menu");
}
