import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Signup() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await signup(name, company, email, password); navigate("/dashboard"); } catch (err) { setError(err.response?.data?.detail || "Signup failed"); } finally { setLoading(false); }
  };
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="panel p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Get started</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Create company account</h2>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Your name<input className="field mt-1.5" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Company name<input className="field mt-1.5" placeholder="Airtel / Jio / Vi" value={company} onChange={(e) => setCompany(e.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Company email<input className="field mt-1.5" placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Password<input className="field mt-1.5" placeholder="Create a password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="primary-button w-full hover:shadow-md hover:bg-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Creating..." : "Register company"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}
