import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("userEmail");
    return email ? { email } : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("userEmail", email);
    setToken(data.access_token);
    setUser({ email });
  };

  const signup = async (email, password) => {
    const { data } = await api.post("/api/auth/signup", { email, password });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("userEmail", email);
    setToken(data.access_token);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, login, signup, logout, isAuth: !!token }}>{children}</AuthContext.Provider>;
}
