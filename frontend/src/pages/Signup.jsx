import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try { await signup(email, password); navigate("/dashboard"); } catch (err) { setError(err.response?.data?.detail || "Signup failed"); }
  };
  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold">Sign Up</h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Create Account</button>
      </form>
      <p className="mt-4 text-sm">Have account? <Link to="/login" className="text-blue-600">Login</Link></p>
    </div>
  );
}
