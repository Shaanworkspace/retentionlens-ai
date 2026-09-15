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
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="panel p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Welcome back</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Log in to ChurnSense</h2>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Email<input className="field mt-1.5" placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Password<input className="field mt-1.5" placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="primary-button w-full">Log in</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">No account? <Link to="/signup" className="font-semibold text-slate-900 hover:underline">Create one</Link></p>
      </div>
    </div>
  );
}
