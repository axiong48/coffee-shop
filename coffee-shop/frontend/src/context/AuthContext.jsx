import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await api.post("/auth/login", { email, password });
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (payload) => {
    const u = await api.post("/auth/signup", payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (err) {
      // Even if this fails (e.g. session already expired server-side),
      // we still want the UI to reflect logged-out state.
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await api.get("/auth/me");
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
