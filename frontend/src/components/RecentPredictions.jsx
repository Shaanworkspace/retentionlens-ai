import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const badge = (p) => p >= 0.65 ? "bg-red-100 text-red-700" : p >= 0.4 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
const label = (p) => p >= 0.65 ? "Will Churn" : p >= 0.4 ? "Tends to Churn" : "Will Stay";

export default function RecentPredictions() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/api/predict/history").then((r) => setRows(r.data)).catch(() => {});
  }, []);
  if (rows.length === 0) return <p className="text-sm text-slate-500">No analysis yet — run your first prediction above and it will appear here.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <button key={r.id} onClick={() => navigate(`/customer/${r.id}`)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <p className="truncate text-base font-bold text-slate-900">{r.customer_name || `Customer #${r.id}`}</p>
          <p className="mt-0.5 text-sm text-slate-500">{r.contract} · {r.internet_service} · {r.tenure}m</p>
          <p className="mt-1 text-xs text-slate-400">{fmtDate(r.created_at)}</p>
          <div className="mt-3 flex items-center gap-3 text-sm"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge(r.probability)}`}>{label(r.probability)}</span><span className="font-bold text-slate-900">{Math.round(r.probability * 100)}%</span>{r.offered_index != null && <span className="text-xs text-green-600">· Offered ✓</span>}</div>
        </button>
      ))}
    </div>
  );
}
