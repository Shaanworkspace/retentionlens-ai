import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";

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
  const navigate = useNavigate();
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const openCustomer = (h) => navigate(`/customer/${h.id}`);

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
          <button onClick={() => result.prediction_id && navigate(`/customer/${result.prediction_id}`)} disabled={!result.prediction_id} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">Open full dashboard →</button>
        </div>}
      </section>
      <aside className="glass-card h-fit rounded-2xl p-6"><p className="eyebrow">History</p><h2 className="mt-2 text-xl font-semibold">Customers</h2>
        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {history.length === 0 && <p className="text-sm text-slate-500">No customers yet — predict above.</p>}
          {history.map((h) => <button key={h.id} onClick={() => openCustomer(h)} className="w-full rounded-xl border border-white/60 bg-white/70 p-3 text-left hover:shadow-md"><p className="font-semibold text-slate-800">{h.customer_name || `Customer #${h.id}`}</p><p className="text-xs" style={{ color: tierColor(h.probability >= 0.65 ? "red" : h.probability >= 0.4 ? "yellow" : "green") }}>{h.churn_label} · {h.probability}{h.offered_index != null ? " · Offered ✓" : ""}</p></button>)}
        </div>
      </aside>
    </div>

  </>;
}

function Field({ label, value, type, step, min, onChange }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="ml-1 text-red-500">*</span><input className="field mt-1.5" required type={type} step={step} min={min} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
