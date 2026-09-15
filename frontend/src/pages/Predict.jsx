import { useState } from "react";
import api from "../services/api";
const defaults = { tenure: 12, MonthlyCharges: 70.5, TotalCharges: 800.2, gender: "Male", Partner: "Yes", Dependents: "No", PhoneService: "Yes", MultipleLines: "No", InternetService: "Fiber optic", OnlineSecurity: "No", OnlineBackup: "Yes", DeviceProtection: "No", TechSupport: "No", StreamingTV: "No", StreamingMovies: "No", Contract: "Month-to-month", PaperlessBilling: "Yes", PaymentMethod: "Electronic check" };
export default function Predict() {
  const [form, setForm] = useState(defaults);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const change = (k, v) => setForm({ ...form, [k]: v });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try { const { data } = await api.post("/api/predict", form); setResult(data); } catch (err) { setError(err.response?.data?.detail || "Prediction failed. Login required."); }
  };
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 border rounded bg-white">
      <h2 className="text-2xl font-bold">Churn Prediction</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4 mt-4">
        <input className="border p-2 rounded" type="number" value={form.tenure} onChange={(e) => change("tenure", parseInt(e.target.value))} placeholder="Tenure" />
        <input className="border p-2 rounded" type="number" step="0.1" value={form.MonthlyCharges} onChange={(e) => change("MonthlyCharges", parseFloat(e.target.value))} placeholder="MonthlyCharges" />
        <input className="border p-2 rounded" type="number" step="0.1" value={form.TotalCharges} onChange={(e) => change("TotalCharges", parseFloat(e.target.value))} placeholder="TotalCharges" />
        <select className="border p-2 rounded" value={form.Contract} onChange={(e) => change("Contract", e.target.value)}><option>Month-to-month</option><option>One year</option><option>Two year</option></select>
        <select className="border p-2 rounded" value={form.InternetService} onChange={(e) => change("InternetService", e.target.value)}><option>DSL</option><option>Fiber optic</option><option>No</option></select>
        <select className="border p-2 rounded" value={form.PaymentMethod} onChange={(e) => change("PaymentMethod", e.target.value)}><option>Electronic check</option><option>Mailed check</option><option>Bank transfer (automatic)</option><option>Credit card (automatic)</option></select>
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded">Predict</button>
      </form>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {result && <div className={`mt-4 p-4 rounded ${result.churn ? "bg-red-100" : "bg-green-100"}`}><p className="font-bold">Churn: {result.churn_label} ({result.probability})</p></div>}
    </div>
  );
}
