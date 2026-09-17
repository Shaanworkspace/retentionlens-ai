import { useState } from "react";
import api from "../services/api";
export default function Offers() {
  const [form] = useState({ tenure: 8, MonthlyCharges: 85.5, TotalCharges: 600, gender: "Female", Partner: "No", Dependents: "No", PhoneService: "Yes", MultipleLines: "Yes", InternetService: "Fiber optic", OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No", TechSupport: "No", StreamingTV: "Yes", StreamingMovies: "Yes", Contract: "Month-to-month", PaperlessBilling: "Yes", PaymentMethod: "Electronic check" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const run = async () => {
    setError("");
    setLoading(true);
    try { const { data } = await api.post("/api/retention/offers", form); setData(data); } catch (err) { setError(err.response?.data?.detail || "Offers could not be generated right now."); } finally { setLoading(false); }
  };
  return (
    <main className="mx-auto min-h-[calc(100vh-100px)] max-w-6xl px-5 py-10 sm:px-8">
      <div className="mb-7"><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Retention workspace</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Personalized offers</h2><p className="mt-2 text-slate-600">Generate practical retention recommendations from the customer profile.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
      <div className="panel p-6 sm:p-8">
       <button onClick={run} disabled={loading} className="primary-button hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Preparing recommendations..." : "Generate offers"}</button>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {data && <div className="mt-6"><p className="text-sm text-slate-500">Churn assessment</p><p className="mt-1 font-semibold text-slate-900">{data.churn_label} <span className="font-normal text-slate-600">({data.probability})</span></p><p className="mt-6 text-sm font-semibold text-slate-900">Recommended offers (minimum 3)</p><div className="mt-2 grid gap-3">{(data.offers && Array.isArray(data.offers) ? data.offers : [data.offers_text || data.offers]).map((offer, i) => <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold">Offer {i + 1}</p><p className="mt-1 text-sm leading-6 text-slate-700">{offer}</p></div>)}</div></div>}
      </div>
      <aside className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6"><p className="text-sm font-semibold text-amber-950">Example customer</p><p className="mt-2 text-sm leading-6 text-amber-900/75">This workspace uses a month-to-month fiber customer with a short tenure as a practical high-risk example.</p><div className="mt-6 space-y-3 text-sm"><div className="rounded-xl bg-white/70 p-3"><p className="font-medium text-slate-800">Profile</p><p className="mt-1 text-slate-600">8 months · ₹85.50 monthly</p></div><div className="rounded-xl bg-white/70 p-3"><p className="font-medium text-slate-800">Expected output</p><p className="mt-1 text-slate-600">Two actionable, customer-friendly retention ideas.</p></div></div></aside>
      </div>
    </main>
  );
}
