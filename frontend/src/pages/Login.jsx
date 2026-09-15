import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try { await login(email, password); navigate("/dashboard"); } catch (err) { setError(err.response?.data?.detail || "Login failed"); }
  };
  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold">Login</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <p className="mt-4 text-sm">No account? <Link to="/signup" className="text-blue-600">Sign up</Link></p>
    </div>
  );
}
