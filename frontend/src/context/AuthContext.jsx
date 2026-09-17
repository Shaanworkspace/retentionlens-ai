import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    if (token && !user) {
      api.get("/api/auth/me").then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }).catch(() => {});
    }
  }, [token]);

  const saveSession = (accessToken, profile) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(profile));
    setToken(accessToken);
    setUser(profile);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const { data: profile } = await api.get("/api/auth/me", { headers: { Authorization: `Bearer ${data.access_token}` } });
    saveSession(data.access_token, profile);
  };

  const signup = async (name, company, email, password) => {
    const { data } = await api.post("/api/auth/signup", { name, company, email, password });
    const { data: profile } = await api.get("/api/auth/me", { headers: { Authorization: `Bearer ${data.access_token}` } });
    saveSession(data.access_token, profile);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, login, signup, logout, isAuth: !!token }}>{children}</AuthContext.Provider>;
}
