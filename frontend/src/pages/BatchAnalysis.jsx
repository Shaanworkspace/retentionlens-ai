import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function BatchAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [paste, setPaste] = useState("");
  const [batchName, setBatchName] = useState("");
  const [s3url, setS3url] = useState("");
  const [s3name, setS3name] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [runs, setRuns] = useState([]);

  const loadRuns = () => api.get("/api/batch/runs").then(({ data }) => setRuns(data)).catch(() => {});
  useEffect(() => { loadRuns(); }, []);

  const uploadFile = async (f) => {
    if (!f) return setError("Select a CSV file first");
    if (!f.name.endsWith(".csv")) return setError("Only CSV files here - bigger files go to the S3 option below");
    setLoading(true); setError("");
    const form = new FormData(); form.append("file", f); form.append("name", batchName);
    try { const { data } = await api.post("/api/batch/predict", form, { headers: { "Content-Type": "multipart/form-data" } }); navigate(`/batch/${data.run_id}`); }
    catch (e) { setError(e.response?.data?.detail || "Batch failed"); }
    finally { setLoading(false); }
  };

  const uploadPaste = async () => {
    if (!paste.trim()) return setError("Paste CSV content first");
    const blob = new Blob([paste], { type: "text/csv" });
    const f = new File([blob], "pasted.csv", { type: "text/csv" });
    setLoading(true); setError("");
    const form = new FormData(); form.append("file", f); form.append("name", batchName); form.append("source", "paste");
    try { const { data } = await api.post("/api/batch/predict", form, { headers: { "Content-Type": "multipart/form-data" } }); navigate(`/batch/${data.run_id}`); }
    catch (e) { setError(e.response?.data?.detail || "Batch failed"); }
    finally { setLoading(false); }
  };

  const uploadS3 = async () => {
    if (!s3url.trim()) return setError("Paste your S3 file URL first");
    setLoading(true); setError("");
    try { const { data } = await api.post("/api/batch/s3", { url: s3url.trim(), name: s3name || null }); navigate(`/batch/${data.run_id}`); }
    catch (e) { setError(e.response?.data?.detail || "S3 batch failed"); }
    finally { setLoading(false); }
  };

  return <><Breadcrumbs current="Batch Customers" />
    <p className="eyebrow">Batch customers</p>
    <h1 className="page-title mt-1">Score customers in bulk</h1>
    <p className="page-subtitle">Three quick ways to send a customer list. Direct uploads take CSV files up to 20MB / 5000 rows. Anything bigger goes through your S3 bucket.</p>

    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); uploadFile(f); } }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="text-sm font-semibold text-slate-800">Batch name <span className="font-normal text-slate-400">(optional)</span></label><input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Batch A — auto-named if empty" className="field mt-1.5" /></div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Paste runs are auto-named <b>Batch A, Batch B, Batch C…</b> when you leave the name empty. File uploads use the file name by default.</div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 1 · Drag and drop <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">up to 20MB</span></h2>
      <div className={`mt-3 rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}>
        <p className="text-lg font-semibold text-slate-800">Drop your CSV file here</p>
        <p className="mt-1 text-sm text-slate-500">Scoring starts the moment you drop it. Max 20MB / 5000 rows.</p>
      </div>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 2 · Choose a file <span className="ml-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">up to 20MB</span></h2>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="field" />
        <button onClick={() => uploadFile(file)} disabled={loading} className="primary-button shrink-0 hover:shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Scoring your file..." : "Upload and analyze"}</button>
      </div>
      {file && <p className="mt-2 text-xs text-slate-500">Selected: {file.name}</p>}

      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 3 · Paste rows directly</h2>
      <p className="mt-1 text-sm text-slate-500">Copy rows from Excel or Sheets (with the header row) and paste them below.</p>
      <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"tenure,MonthlyCharges,TotalCharges,gender,Partner,Dependents,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod\n12,70.5,800,Female,Yes,No,Yes,No,Fiber optic,No,Yes,No,No,No,No,Month-to-month,Yes,Electronic check"} className="field mt-3 h-28 font-mono text-xs" />
      <button onClick={uploadPaste} disabled={loading} className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Scoring pasted rows..." : "Analyze pasted rows"}</button>

      <h2 className="mt-8 text-lg font-bold text-slate-900">Option 4 · Large files over 5GB <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">via S3</span></h2>
      <p className="mt-1 text-sm text-slate-500">Files bigger than 5GB can't travel through the browser — upload yours to your S3 bucket first (make the object public or create a presigned URL), then paste that URL here. We stream and score it server-side.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_240px]">
        <input value={s3url} onChange={(e) => setS3url(e.target.value)} placeholder="https://your-bucket.s3.amazonaws.com/customers-10gb.csv?presigned…" className="field font-mono text-xs" />
        <input value={s3name} onChange={(e) => setS3name(e.target.value)} placeholder="Batch name (optional)" className="field" />
      </div>
      <button onClick={uploadS3} disabled={loading} className="mt-3 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Streaming from S3..." : "Score from S3"}</button>

      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Your file needs these columns: tenure, MonthlyCharges, TotalCharges, gender, Partner, Dependents, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod. An optional customer_name column is picked up automatically.</p>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>

    <h2 className="mt-10 text-xl font-bold text-slate-900">Upload history</h2>
    <p className="mt-1 text-sm text-slate-500">Every file you score leaves a card here with its date and time. Click any card to open its full analysis.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {runs.length === 0 && <p className="text-sm text-slate-500">No batches yet — your first upload will appear here.</p>}
      {runs.map((r) => <button key={r.id} onClick={() => navigate(`/batch/${r.id}`)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <p className="truncate text-base font-bold text-slate-900">{r.filename || r.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">{r.name} · {r.source === "s3" ? "S3" : r.source === "paste" ? "Pasted" : "Uploaded"}</p>
        <p className="mt-1 text-xs text-slate-400">{fmtDate(r.created_at)}</p>
        <div className="mt-3 flex gap-4 text-sm"><span className="font-bold">{r.total} rows</span><span className="font-bold text-red-600">{r.churn_count} churn</span><span className="font-bold text-yellow-600">{r.tends_count} tends</span><span className="font-bold text-green-600">{r.stay_count} stay</span></div>
      </button>)}
    </div>
  </>;
}
