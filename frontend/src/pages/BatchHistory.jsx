import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";

export const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function BatchHistory() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  useEffect(() => { api.get("/api/batch/runs").then(({ data }) => setRuns(data)).catch(() => {}); }, []);

  return <><Breadcrumbs current="Batch History" />
    <p className="eyebrow">Previous runs</p>
    <h1 className="page-title mt-1">Batch history</h1>
    <p className="page-subtitle">Every batch you have ever scored, newest first. Click any card for its full analysis with graphs.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {runs.length === 0 && <p className="text-sm text-slate-500">No batches yet — score your first file from Batch Customers.</p>}
      {runs.map((r) => <button key={r.id} onClick={() => navigate(`/batch/${r.id}`)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <p className="truncate text-base font-bold text-slate-900">{r.filename || r.name}</p>
        <p className="mt-0.5 text-sm text-slate-500">{r.name} · {r.source === "s3" ? "S3" : r.source === "paste" ? "Pasted" : "Uploaded"}</p>
        <p className="mt-1 text-xs text-slate-400">{fmtDate(r.created_at)}</p>
        <div className="mt-3 flex gap-4 text-sm"><span className="font-bold">{r.total} rows</span><span className="font-bold text-red-600">{r.churn_count} churn</span><span className="font-bold text-yellow-600">{r.tends_count} tends</span><span className="font-bold text-green-600">{r.stay_count} stay</span></div>
      </button>)}
    </div>
  </>;
}
