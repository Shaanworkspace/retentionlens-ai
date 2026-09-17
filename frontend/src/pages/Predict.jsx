import { useEffect, useState } from "react";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import { IconSpark, IconCheck, IconX } from "../components/icons";

const defaults = {
  customer_name: "", tenure: 12, MonthlyCharges: 70.5, TotalCharges: 800.2, gender: "Male",
  Partner: "Yes", Dependents: "No", PhoneService: "Yes", MultipleLines: "No",
  InternetService: "Fiber optic", OnlineSecurity: "No", OnlineBackup: "Yes",
  DeviceProtection: "No", TechSupport: "No", StreamingTV: "No",
  StreamingMovies: "No", Contract: "Month-to-month", PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
};

const fields = [
  ["gender", "Gender", ["Male", "Female"]],
  ["Partner", "Partner", ["Yes", "No"]],
  ["Dependents", "Dependents", ["Yes", "No"]],
  ["PhoneService", "Phone service", ["Yes", "No"]],
  ["MultipleLines", "Multiple lines", ["Yes", "No", "No phone service"]],
  ["InternetService", "Internet service", ["DSL", "Fiber optic", "No"]],
  ["OnlineSecurity", "Online security", ["Yes", "No", "No internet service"]],
  ["OnlineBackup", "Online backup", ["Yes", "No", "No internet service"]],
  ["DeviceProtection", "Device protection", ["Yes", "No", "No internet service"]],
  ["TechSupport", "Tech support", ["Yes", "No", "No internet service"]],
  ["StreamingTV", "Streaming TV", ["Yes", "No", "No internet service"]],
  ["StreamingMovies", "Streaming movies", ["Yes", "No", "No internet service"]],
  ["Contract", "Contract", ["Month-to-month", "One year", "Two year"]],
  ["PaperlessBilling", "Paperless billing", ["Yes", "No"]],
  ["PaymentMethod", "Payment method", ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]],
];

const tierColor = (c) => c === "red" ? "#ef4444" : c === "yellow" ? "#eab308" : "#22c55e";

export default function Predict() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerId, setOfferId] = useState(null);
  const [offeredIdx, setOfferedIdx] = useState(null);
  const [savedPct, setSavedPct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const loadHistory = () => api.get("/api/predict/history").then(({ data }) => setHistory(data)).catch(() => {});
  useEffect(() => { loadHistory(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/api/predict", form);
      setResult({ ...data, form: { ...form } });
      loadHistory();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Prediction failed. Please check the customer details.");
    } finally { setLoading(false); }
  };

  const openCustomer = (h) => {
    setOpenId(h.id); setOffers([]); setOfferId(h.id); setOfferedIdx(h.offered_index ?? null); setSavedPct(null);
    setResult({ prediction_id: h.id, probability: h.probability, churn_label: h.churn_label, risk_category: h.probability >= 0.65 ? { id: 3, label: "Will Churn", detail: "Churning - Critical", color: "red", score: "65-100", action: "Immediate intervention" } : h.probability >= 0.4 ? { id: 2, label: "Tends to Churn", detail: "At Risk - Needs Attention", color: "yellow", score: "40-65", action: "Proactive outreach" } : { id: 1, label: "Will Stay", detail: "Not Churn - Positive", color: "green", score: "0-40", action: "Nurture & upsell" }, form: { customer_name: h.customer_name, tenure: h.tenure, Contract: h.contract } });
    if (h.offers) {
      try {
        const parsed = JSON.parse(h.offers);
        if (Array.isArray(parsed)) setOffers(parsed);
      } catch { /* stored as text */ }
    }
  };

  const genOffers = async () => {
    if (!result) return;
    setOfferLoading(true);
    try {
      const payload = { ...result.form, tenure: Number(result.form.tenure), MonthlyCharges: Number(result.form.MonthlyCharges), TotalCharges: Number(result.form.TotalCharges) };
      const { data } = await api.post("/api/retention/offers", payload);
      setOffers(data.offers && data.offers.length ? data.offers : [data.offers_text]);
      if (data.prediction_id) setOfferId(data.prediction_id);
      setOfferedIdx(null); setSavedPct(null);
      loadHistory();
    } catch { setError("Offer generation failed. Try again."); }
    finally { setOfferLoading(false); }
  };

  const markOffered = async (idx) => {
    if (!offerId) return;
    try {
      const { data } = await api.patch(`/api/predict/${offerId}/outcome`, { offered_index: idx });
      setOfferedIdx(data.offered_index);
      setSavedPct(data.retention_chance);
      loadHistory();
    } catch {}
  };

  return <><Breadcrumbs current="Single Customer" />
    <div className="mb-7"><p className="eyebrow">Single customer</p><h1 className="page-title mt-1">Customer details</h1><p className="page-subtitle">Enter the telecom account profile. Scroll the form, then run prediction.</p></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="panel max-h-[70vh] overflow-y-auto p-6 sm:p-8">
        <form onSubmit={submit}>
          <div className="mb-7"><h2 className="text-lg font-semibold text-slate-900">Customer identity</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">Customer name<span className="ml-1 text-red-500">*</span><input className="field mt-1.5" placeholder="Rahul Verma" value={form.customer_name} onChange={(e) => change("customer_name", e.target.value)} required /></label>
              <Field label="Tenure (months)" value={form.tenure} type="number" min="0" onChange={(v) => change("tenure", Number(v))} />
              <Field label="Monthly charges" value={form.MonthlyCharges} type="number" step="0.01" min="0" onChange={(v) => change("MonthlyCharges", Number(v))} />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-3"><Field label="Total charges" value={form.TotalCharges} type="number" step="0.01" min="0" onChange={(v) => change("TotalCharges", Number(v))} /></div>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Services</h2><p className="mb-5 text-sm text-slate-500">All fields are required by the churn model.</p>
          <div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, options]) => <label key={key} className="block text-sm font-medium text-slate-700">{label}<span className="ml-1 text-red-500">*</span><select className="field mt-1.5" value={form[key]} onChange={(e) => change(key, e.target.value)} required>{options.map((o) => <option key={o}>{o}</option>)}</select></label>)}</div>
          <button type="submit" disabled={loading} className="primary-button mt-8 w-full py-4 text-base hover:shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Predicting..." : "Predict churn"}</button>
        </form>
        {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {result && <div className={`mt-6 rounded-xl border p-5 ${result.risk_category.color === "red" ? "border-red-200 bg-red-50" : result.risk_category.color === "yellow" ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}>
          <p className="font-bold">{result.risk_category.label} · {result.probability}</p>
          <button onClick={() => { setOpenId(result.prediction_id || "new"); setOffers([]); setOfferId(result.prediction_id); setOfferedIdx(null); }} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Open full dashboard →</button>
        </div>}
      </section>
      <aside className="glass-card h-fit rounded-2xl p-6"><p className="eyebrow">History</p><h2 className="mt-2 text-xl font-semibold">Customers</h2>
        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {history.length === 0 && <p className="text-sm text-slate-500">No customers yet — predict above.</p>}
          {history.map((h) => <button key={h.id} onClick={() => openCustomer(h)} className="w-full rounded-xl border border-white/60 bg-white/70 p-3 text-left hover:shadow-md"><p className="font-semibold text-slate-800">{h.customer_name || `Customer #${h.id}`}</p><p className="text-xs" style={{ color: tierColor(h.probability >= 0.65 ? "red" : h.probability >= 0.4 ? "yellow" : "green") }}>{h.churn_label} · {h.probability}{h.offered_index != null ? " · Offered ✓" : ""}</p></button>)}
        </div>
      </aside>
    </div>

    {openId && result && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between"><div><p className="eyebrow">Customer dashboard</p><h2 className="mt-1 text-2xl font-bold">{result.form.customer_name || "Customer"}</h2><p className="text-sm text-slate-500">Tenure {result.form.tenure}m · {result.form.Contract}</p></div><button onClick={() => setOpenId(null)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close dashboard"><IconX /></button></div>
        <div className="mt-5 rounded-xl p-5 text-white" style={{ background: tierColor(result.risk_category.color) }}>
          <p className="text-sm opacity-90">{result.risk_category.detail}</p>
          <p className="text-3xl font-bold">{result.risk_category.label} · {Math.round(result.probability * 100)}%</p>
          <p className="text-sm opacity-90">{result.risk_category.action}</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4"><p className="text-sm font-semibold">Churn probability</p><div className="mt-2 h-3 rounded bg-slate-200"><div className="h-3 rounded" style={{ width: `${result.probability * 100}%`, background: tierColor(result.risk_category.color) }} /></div><p className="mt-1 text-xs text-slate-500">Model output on 7043-record training</p></div>
          <div className="rounded-xl border p-4"><p className="text-sm font-semibold">Risk meter</p><div className="mt-2 flex gap-2">{[1, 2, 3].map((i) => <div key={i} className="h-3 flex-1 rounded" style={{ background: i <= result.risk_category.id ? tierColor(result.risk_category.color) : "#e2e8f0" }} />)}</div><p className="mt-1 text-xs text-slate-500">Tier {result.risk_category.id}/3 · Score {result.risk_category.score}</p></div>
          <div className="rounded-xl border p-4"><p className="text-sm font-semibold">Tenure vs churn</p><div className="mt-2 h-3 rounded bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" /><div className="relative h-4"><div className="absolute top-0 h-4 w-1 bg-slate-900" style={{ left: `${Math.min(100, (result.form.tenure / 72) * 100)}%` }} /></div><p className="text-xs text-slate-500">This customer at {result.form.tenure}m (0–12m churns 47%)</p></div>
          <div className="rounded-xl border p-4"><p className="text-sm font-semibold">Contract risk</p><div className="mt-2 space-y-1 text-xs"><div className="flex justify-between"><span>Month-to-month</span><span className="font-bold text-red-600">42%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-red-500" style={{ width: "42%" }} /></div><div className="flex justify-between"><span>One year</span><span className="font-bold text-yellow-600">11%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-yellow-400" style={{ width: "11%" }} /></div><div className="flex justify-between"><span>Two year</span><span className="font-bold text-green-600">3%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-green-500" style={{ width: "3%" }} /></div></div></div>
        </div>
        <div className="mt-6"><button onClick={genOffers} disabled={offerLoading} className="primary-button w-full py-3 hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2">{offerLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{offerLoading ? "Generating with Gemini..." : "Generate offers (GenAI)"}</button></div>
        {offers.length > 0 && <div className="mt-4 grid gap-4 md:grid-cols-3">
          {offers.map((offer, idx) => <div key={idx} className={`rounded-xl border p-4 ${offeredIdx === idx ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}>
            <p className="flex items-center gap-2 text-sm font-bold"><IconSpark className="h-4 w-4 text-amber-500" />Offer {idx + 1}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{offer}</p>
            <button onClick={() => markOffered(idx)} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${offeredIdx === idx ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`}>{offeredIdx === idx ? <><IconCheck className="h-4 w-4" />Offered ✓</> : "Mark as Offered"}</button>
          </div>)}
        </div>}
        {savedPct != null && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">Saved for this customer. Retention chance now {savedPct}%.</p>}
      </div>
    </div>}
  </>;
}

function Field({ label, value, type, step, min, onChange }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="ml-1 text-red-500">*</span><input className="field mt-1.5" required type={type} step={step} min={min} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
