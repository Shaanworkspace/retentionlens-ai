import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";

const defaults = {
  tenure: 12, MonthlyCharges: 70.5, TotalCharges: 800.2, gender: "Male",
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

export default function Predict() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/predict", form);
      setResult(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Prediction failed. Please check the customer details.");
    } finally {
      setLoading(false);
    }
  };
  const reasons = [
    form.Contract === "Month-to-month" ? "Month-to-month contracts show higher churn risk." : "A longer contract provides retention stability.",
    form.tenure <= 12 ? "Early-tenure customers need proactive engagement." : "Established tenure is a positive health signal.",
    form.InternetService === "Fiber optic" ? "Fiber optic accounts need service-value reinforcement." : "The selected service profile is a lower-risk signal.",
  ];
  return <><Breadcrumbs current="Analyze Customer" /><div className="mb-7"><p className="eyebrow">Customer risk assessment</p><h1 className="page-title mt-1">Analyze Customer</h1><p className="page-subtitle">Complete the telecom account profile below. Every field is required by the churn model.</p></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]"><section className="panel p-6 sm:p-8"><form onSubmit={submit}>
      <div className="mb-7"><h2 className="text-lg font-semibold text-slate-900">Account and billing</h2><p className="mt-1 text-sm text-slate-500">Use the latest values from your CRM or billing system.</p></div>
      <div className="grid gap-5 sm:grid-cols-3"><Field label="Tenure (months)" value={form.tenure} type="number" min="0" onChange={(value) => change("tenure", Number(value))} /><Field label="Monthly charges" value={form.MonthlyCharges} type="number" step="0.01" min="0" onChange={(value) => change("MonthlyCharges", Number(value))} /><Field label="Total charges" value={form.TotalCharges} type="number" step="0.01" min="0" onChange={(value) => change("TotalCharges", Number(value))} /></div>
      <h2 className="mb-1 mt-8 text-lg font-semibold text-slate-900">Customer services</h2><p className="mb-5 text-sm text-slate-500">Capture the customer relationship and subscribed services.</p>
      <div className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, options]) => <label key={key} className="block text-sm font-medium text-slate-700">{label}<span className="ml-1 text-red-500">*</span><select className="field mt-1.5" value={form[key]} onChange={(event) => change(key, event.target.value)} required>{options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div>
      <button type="submit" disabled={loading} className="primary-button mt-8 w-full sm:w-auto">{loading ? "Analyzing customer..." : "Run churn analysis"}</button>
    </form>{error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {result && <div className="space-y-4"><div className={`mt-8 rounded-xl border p-6 ${result.churn ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}><p className="text-sm font-semibold text-slate-500">Analysis complete</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><p className="text-3xl font-bold text-slate-900">Churn: {result.churn_label}</p><p className="mt-1 text-sm text-slate-600">Predicted probability: {result.probability} · Health: {result.probability > 0.6 ? "At-Risk" : "Healthy"}</p></div><Link to="/offers" className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Create retention offer</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{reasons.map((reason) => <p key={reason} className="rounded-lg bg-white/70 p-3 text-sm leading-5 text-slate-700">● {reason}</p>)}</div></div>
      <div className="panel p-6"><h3 className="font-semibold">Individual dashboard</h3><div className="mt-4 grid grid-cols-3 gap-4 text-center"><div className="rounded bg-slate-50 p-3"><p className="text-xs text-slate-500">Tenure</p><p className="font-bold">{form.tenure}m</p></div><div className="rounded bg-slate-50 p-3"><p className="text-xs text-slate-500">Monthly</p><p className="font-bold">₹{form.MonthlyCharges}</p></div><div className="rounded bg-slate-50 p-3"><p className="text-xs text-slate-500">Contract</p><p className="font-bold">{form.Contract}</p></div></div><div className="mt-4 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-red-500" style={{ width: `${result.probability * 100}%` }} /></div><p className="mt-2 text-xs text-slate-500">Full offer for this customer available on Offers page → Generate Offers with same details.</p></div>
      </div>}</section>
      <aside className="glass-card h-fit rounded-2xl p-6"><p className="eyebrow">What to enter</p><h2 className="mt-2 text-xl font-semibold text-slate-900">Complete customer context</h2><p className="mt-3 text-sm leading-6 text-slate-600">The model uses account tenure, billing behavior, contract terms, and service adoption to estimate churn risk.</p><div className="mt-6 space-y-3 text-sm"><Tip title="Mandatory fields" text="All fields marked with * are required for a valid analysis." /><Tip title="Use current values" text="Use the latest invoice and active service status for best results." /><Tip title="Review the result" text="Pair the probability with customer context before taking action." /></div></aside>
    </div></>;
}

function Field({ label, value, type, step, min, onChange }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="ml-1 text-red-500">*</span><input className="field mt-1.5" required type={type} step={step} min={min} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Tip({ title, text }) {
  return <div className="rounded-lg border border-white/60 bg-white/60 p-3"><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>;
}
