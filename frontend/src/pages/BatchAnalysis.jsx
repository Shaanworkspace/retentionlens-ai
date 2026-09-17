import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";

export default function BatchAnalysis() {
  const [file, setFile] = useState(null);
  const [paste, setPaste] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offersMap, setOffersMap] = useState({});
  const [stageMap, setStageMap] = useState({});
  const [offerLoading, setOfferLoading] = useState({});

  const uploadFile = async (f) => {
    if (!f) return setError("Select a CSV file first");
    if (!f.name.endsWith(".csv")) return setError("Only CSV allowed - other files later");
    setLoading(true); setError("");
    const form = new FormData(); form.append("file", f);
    try { const { data } = await api.post("/api/batch/predict", form, { headers: { "Content-Type": "multipart/form-data" } }); setResult(data); }
    catch (e) { setError(e.response?.data?.detail || "Batch failed"); }
    finally { setLoading(false); }
  };

  const uploadPaste = async () => {
    if (!paste.trim()) return setError("Paste CSV content first");
    const blob = new Blob([paste], { type: "text/csv" });
    const f = new File([blob], "pasted.csv", { type: "text/csv" });
    await uploadFile(f);
  };

  const genOffers = async (row) => {
    setOfferLoading((m) => ({ ...m, [row.row]: true }));
    try {
      const { data } = await api.post("/api/retention/offers", row.data);
      setOffersMap((m) => ({ ...m, [row.row]: data.offers }));
      setStageMap((m) => ({ ...m, [row.row]: 1 }));
    } catch {} finally { setOfferLoading((m) => ({ ...m, [row.row]: false })); }
  };

  const advanceStage = (row) => setStageMap((m) => ({ ...m, [row]: Math.min(3, (m[row] || 1) + 1) }));

  const counts = result ? {
    willStay: result.results.filter(r => r.risk_category?.id === 1).length,
    tendsNot: result.results.filter(r => r.risk_category?.id === 1).length,
    tends: result.results.filter(r => r.risk_category?.id === 2).length,
    churn: result.results.filter(r => r.risk_category?.id === 3).length,
  } : null;

  const segCounts = result ? {
    notChurn: result.results.filter(r => r.risk_category?.id === 1).length,
    tends: result.results.filter(r => r.risk_category?.id === 2).length,
    willChurn: result.results.filter(r => r.risk_category?.id === 3).length,
  } : null;

  return <><Breadcrumbs current="Batch Customers" /><p className="eyebrow">Batch customers</p><h1 className="page-title mt-1">Score customers in bulk</h1><p className="page-subtitle">Three easy ways to send us your customer list — pick any one. We accept CSV files up to 5000 rows (20MB) and split every customer into Not Churn, Tends to Churn, or Will Churn.</p>
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); uploadFile(f); } }}>
      <h2 className="text-lg font-bold text-slate-900">Option 1 · Drag and drop your file</h2>
      <div className={`mt-3 rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}>
        <p className="text-lg font-semibold text-slate-800">Drop your CSV file here</p>
        <p className="mt-1 text-sm text-slate-500">We will start scoring the moment you drop it. Only .csv files for now.</p>
      </div>
      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 2 · Choose a file from your computer</h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="field" />
        <button onClick={() => uploadFile(file)} disabled={loading} className="primary-button shrink-0 hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Scoring your file..." : "Upload and analyze"}</button>
      </div>
      {file && <p className="mt-2 text-xs text-slate-500">Selected: {file.name}</p>}
      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 3 · Paste rows directly</h2>
      <p className="mt-1 text-sm text-slate-500">Copy rows from Excel or Sheets (with the header row) and paste them below.</p>
      <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"tenure,MonthlyCharges,TotalCharges,gender,Partner,Dependents,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod\n12,70.5,800,Female,Yes,No,Yes,No,Fiber optic,No,Yes,No,No,No,No,Month-to-month,Yes,Electronic check"} className="field mt-3 h-28 font-mono text-xs" />
      <button onClick={uploadPaste} disabled={loading} className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Scoring pasted rows..." : "Analyze pasted rows"}</button>
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Your file needs these columns: tenure, MonthlyCharges, TotalCharges, gender, Partner, Dependents, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod.</p>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>

    {result && <>
      <div className="mt-6 grid gap-6 sm:grid-cols-4">
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold">{result.total}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Not Churn</p><p className="text-2xl font-bold text-green-600">{segCounts.notChurn}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Tends to Churn</p><p className="text-2xl font-bold text-yellow-600">{segCounts.tends}</p></div>
        <div className="panel p-4 text-center"><p className="text-sm text-slate-500">Will Churn</p><p className="text-2xl font-bold text-red-600">{segCounts.willChurn}</p></div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="panel p-4"><p className="text-xs text-slate-500">Churn Rate</p><p className="text-xl font-bold">{result.churn_rate}% will churn</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Tends Rate</p><p className="text-xl font-bold">{Math.round(segCounts.tends/result.total*100)}% tends</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Graphs</p><p className="text-xs">See individual dashboard after click</p></div>
      </div>
      <div className="mt-6 panel p-6">
        <div className="flex justify-between"><h2 className="font-semibold">Batch dashboard - 3 segments</h2><button onClick={() => {
          const csv = "row,churn,probability,risk,offers\n" + result.results.map(r => `${r.row},${r.churn_label},${r.probability},${r.risk_category?.label},"${(r.offers||"").replace(/"/g,'""')}"`).join("\n");
          const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "batch_results.csv"; a.click();
        }} className="text-sm text-blue-600">Export CSV ↗</button></div>
        <div className="mt-4 max-h-[600px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white border-b"><tr><th className="p-2">#</th><th className="p-2">Tenure</th><th className="p-2">Contract</th><th className="p-2">Prob</th><th className="p-2">Risk</th><th className="p-2">Offers</th></tr></thead>
            <tbody>{result.results.map((r) => (
              <tr key={r.row} className="border-b">
                <td className="p-2">{r.row}</td>
                <td className="p-2">{r.data?.tenure}</td>
                <td className="p-2">{r.data?.Contract}</td>
                <td className="p-2 font-bold" style={{ color: r.risk_category?.color === "red" ? "#ef4444" : r.risk_category?.color === "yellow" ? "#eab308" : "#22c55e" }}>{r.probability}</td>
                <td className="p-2"><span className={`rounded px-2 py-1 text-xs ${r.risk_category?.color === "red" ? "bg-red-100 text-red-700" : r.risk_category?.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{r.risk_category?.label} - {r.risk_category?.detail}</span></td>
                <td className="p-2">
                  {!offersMap[r.row] ? <button onClick={() => genOffers(r)} disabled={offerLoading[r.row]} className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1">{offerLoading[r.row] && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}{offerLoading[r.row] ? "Generating..." : "Generate 2 Offers (GenAI)"}</button> :
                    <div className="max-w-[360px]">
                      <p className="whitespace-pre-line text-xs">{offersMap[r.row]}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`rounded px-2 py-1 text-xs ${stageMap[r.row] >= 1 ? "bg-blue-100" : "bg-slate-100"}`}>1. Offer Sent</span>
                        <span className={`rounded px-2 py-1 text-xs ${stageMap[r.row] >= 2 ? "bg-green-100" : "bg-slate-100"}`}>2. Saved</span>
                        <span className={`rounded px-2 py-1 text-xs ${stageMap[r.row] >= 3 ? "bg-purple-100" : "bg-slate-100"}`}>3. {stageMap[r.row] === 3 ? "Ruka: " + Math.round((1-r.probability)*100) + "%" : "Click to track"}</span>
                      </div>
                      <button onClick={() => advanceStage(r.row)} className="mt-2 text-xs text-blue-600">Advance Stage →</button>
                    </div>
                  }
                </td>
              </tr>))}</tbody>
          </table>
        </div>
      </div>
    </>}
  </>;
}
