import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";

const META = {
  churn: { title: "Will Churn", color: "#ef4444", bg: "bg-red-500", soft: "bg-red-50", text: "text-red-700" },
  tends: { title: "Tends to Churn", color: "#eab308", bg: "bg-yellow-400", soft: "bg-yellow-50", text: "text-yellow-700" },
  stay: { title: "Will Stay", color: "#22c55e", bg: "bg-green-500", soft: "bg-green-50", text: "text-green-700" },
};

const TIERS = [
  { key: "high", title: "High Alert", desc: "Probability 85% and above — act today", color: "#ef4444" },
  { key: "medium", title: "Medium Alert", desc: "Probability 75% to 85% — act this week", color: "#f97316" },
  { key: "low", title: "Low Alert", desc: "Probability 65% to 75% — watch closely", color: "#eab308" },
];

export default function SegmentPage() {
  const { id, seg } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const meta = META[seg] || META.churn;

  useEffect(() => {
    api.get(`/api/batch/runs/${id}/segment/${seg}`).then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.detail || "Could not load segment."));
  }, [id, seg]);

  if (error) return <><Breadcrumbs current="Segment" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to={`/batch/${id}`} className="mt-4 inline-block text-sm text-blue-600">← Back to batch</Link></>;
  if (!data) return <><Breadcrumbs current="Segment" /><p className="text-sm text-slate-500">Loading segment...</p></>;

  const row = (r) => <button key={r.row} onClick={() => navigate(`/batch/${id}/customer/${r.row}`)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <span><span className="block font-bold text-slate-900">{r.customer_name || `Row ${r.row}`}</span><span className="text-xs text-slate-500">Tenure {r.data?.tenure}m · {r.data?.Contract}{r.offered_index != null ? " · Offered ✓" : ""}</span></span>
    <span className="text-lg font-extrabold" style={{ color: meta.color }}>{Math.round(r.probability * 100)}%</span>
  </button>;

  return <><Breadcrumbs current={meta.title} />
    <p className="eyebrow">Segment · {data.run_name}</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{meta.title} <span className="text-xl" style={{ color: meta.color }}>· {data.total}</span></h1>
      <Link to={`/batch/${id}`} className="text-sm font-semibold text-blue-600">← Back to batch</Link>
    </div>

    {seg === "churn" ? <div className="mt-6 space-y-6">
      {TIERS.map((t) => <div key={t.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ background: t.color }} /><h2 className="text-xl font-bold text-slate-900">{t.title} · {(data.tiers?.[t.key] || []).length}</h2></div>
        <p className="mt-1 text-sm text-slate-500">{t.desc} — click any customer for their full dashboard and GenAI offers.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{(data.tiers?.[t.key] || []).map(row)}</div>
        {(data.tiers?.[t.key] || []).length === 0 && <p className="mt-3 text-sm text-slate-400">Nobody in this alert band.</p>}
      </div>)}
    </div> : <div className="mt-6 grid gap-3 sm:grid-cols-2">{data.results.map(row)}</div>}
  </>;
}
