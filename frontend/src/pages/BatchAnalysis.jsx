import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";

export default function BatchAnalysis() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) return setError("Select a CSV file first");
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/api/batch/predict", form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(data);
    } catch (e) { setError(e.response?.data?.detail || "Batch failed"); }
    finally { setLoading(false); }
  };

  return <><Breadcrumbs current="Batch Analysis" /><p className="eyebrow">Bulk operations</p><h1 className="page-title mt-1">Batch customer analysis</h1><p className="page-subtitle">Upload CSV for high-volume scoring (up to 5000 rows, 20MB). Get who will churn, who will not, and per-customer offers.</p>
    <div className="mt-6 panel p-6">
      <div className="flex gap-4 items-center">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="field" />
        <button onClick={upload} disabled={loading} className="primary-button">{loading ? "Scoring..." : "Upload & Analyze"}</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Required columns: tenure, MonthlyCharges, TotalCharges, gender, Partner, Dependents, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>

    {result && <>
      <div className="mt-6 grid gap-6 sm:grid-cols-4">
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{result.total}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Will Churn</p><p className="text-2xl font-bold text-red-600">{result.churn_count}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Will Stay</p><p className="text-2xl font-bold text-green-600">{result.retained_count}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Churn Rate</p><p className="text-2xl font-bold">{result.churn_rate}%</p></div>
      </div>
      <div className="mt-6 panel p-6">
        <div className="flex justify-between"><h2 className="font-semibold">Batch dashboard - who churns</h2><button onClick={() => {
          const csv = "row,churn,probability,offers\n" + result.results.map(r => `${r.row},${r.churn_label},${r.probability},"${(r.offers||"").replace(/"/g,'""')}"`).join("\n");
          const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "batch_results.csv"; a.click();
        }} className="text-sm text-blue-600">Export CSV ↗</button></div>
        <div className="mt-4 max-h-[500px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white border-b"><tr><th className="p-2">#</th><th className="p-2">Tenure</th><th className="p-2">Contract</th><th className="p-2">Prob</th><th className="p-2">Status</th><th className="p-2">Offer</th></tr></thead>
            <tbody>{result.results.map((r) => <tr key={r.row} className="border-b"><td className="p-2">{r.row}</td><td className="p-2">{r.data?.tenure}</td><td className="p-2">{r.data?.Contract}</td><td className="p-2 font-bold" style={{ color: r.churn ? "#ef4444" : "#22c55e" }}>{r.probability}</td><td className="p-2"><span className={`rounded px-2 py-1 text-xs ${r.churn ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{r.churn_label}</span></td><td className="p-2 text-xs max-w-[300px] truncate" title={r.offers}>{r.offers}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>}
  </>;
}
