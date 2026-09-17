import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";
import { fmtDate } from "./BatchHistory";

const pctOf = (a, b) => b ? Math.round((a / b) * 100) : 0;
function churnRate(rows) {
  const c = rows.filter((r) => r.churn === 1).length;
  return { count: c, total: rows.length, rate: pctOf(c, rows.length) };
}
function byContract(rows) {
  const groups = {};
  rows.forEach((r) => { const k = r.data?.Contract || "Unknown"; (groups[k] = groups[k] || []).push(r); });
  return Object.entries(groups).map(([k, v]) => ({ label: k, ...churnRate(v) }));
}
function byTenure(rows) {
  const buckets = { "0-12m": [], "12-24m": [], "24-48m": [], "48m+": [] };
  rows.forEach((r) => {
    const t = Number(r.data?.tenure || 0);
    (t <= 12 ? buckets["0-12m"] : t <= 24 ? buckets["12-24m"] : t <= 48 ? buckets["24-48m"] : buckets["48m+"]).push(r);
  });
  return Object.entries(buckets).map(([k, v]) => ({ label: k, ...churnRate(v) }));
}
function byInternet(rows) {
  const groups = {};
  rows.forEach((r) => { const k = r.data?.InternetService || "Unknown"; (groups[k] = groups[k] || []).push(r); });
  return Object.entries(groups).map(([k, v]) => ({ label: k, ...churnRate(v) }));
}
function byBuckets(rows) {
  const buckets = { "0-40%": [], "40-65%": [], "65-85%": [], "85-100%": [] };
  rows.forEach((r) => {
    const p = Number(r.probability || 0);
    (p < 0.4 ? buckets["0-40%"] : p < 0.65 ? buckets["40-65%"] : p < 0.85 ? buckets["65-85%"] : buckets["85-100%"]).push(r);
  });
  return Object.entries(buckets).map(([k, v]) => ({ label: k, count: v.length, total: rows.length, rate: pctOf(v.length, rows.length) }));
}
function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.rate));
  return <div className="mt-3 space-y-2">{rows.map((r) => <div key={r.label}><div className="flex justify-between text-xs"><span className="font-medium text-slate-700">{r.label} ({r.total})</span><span className="font-bold" style={{ color: r.rate >= 40 ? "#ef4444" : r.rate >= 20 ? "#eab308" : "#22c55e" }}>{r.rate}% churn</span></div><div className="mt-1 h-2 rounded bg-slate-100"><div className="h-2 rounded" style={{ width: `${(r.rate / max) * 100}%`, background: r.rate >= 40 ? "#ef4444" : r.rate >= 20 ? "#eab308" : "#22c55e" }} /></div></div>)}</div>;
}

export default function BatchResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/batch/runs/${id}`).then(({ data }) => setRun(data)).catch((e) => setError(e.response?.data?.detail || "Could not load batch analysis."));
  }, [id]);

  if (error) return <><Breadcrumbs current="Batch analysis" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to="/batches" className="mt-4 inline-block text-sm text-blue-600">← Back to history</Link></>;
  if (!run) return <><Breadcrumbs current="Batch analysis" /><p className="text-sm text-slate-500">Loading full analysis...</p></>;

  const pct = (n) => run.total ? Math.round((n / run.total) * 100) : 0;
  const seg = [
    { key: "churn", label: "Will Churn", count: run.churn_count, color: "#ef4444", bg: "bg-red-500", soft: "hover:border-red-300" },
    { key: "tends", label: "Tends to Churn", count: run.tends_count, color: "#eab308", bg: "bg-yellow-400", soft: "hover:border-yellow-300" },
    { key: "stay", label: "Will Stay", count: run.stay_count, color: "#22c55e", bg: "bg-green-500", soft: "hover:border-green-300" },
  ];

  return <><Breadcrumbs current={run.name} />
    <p className="eyebrow">Batch analysis</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{run.filename || run.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{run.name} · {run.source === "s3" ? "S3" : run.source === "paste" ? "Pasted" : "Uploaded"} · {fmtDate(run.created_at)} · {run.total} customers</p></div>
      <Link to="/batches" className="text-sm font-semibold text-blue-600">← All batches</Link>
    </div>

    <h2 className="mt-8 text-xl font-bold text-slate-900">Overall graphs</h2>
    <p className="mt-1 text-sm text-slate-500">Tap a segment to open its customer list.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      {seg.map((s) => <button key={s.label} onClick={() => navigate(`/batch/${id}/segment/${s.key}`)} className={`rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${s.soft}`}><p className="text-sm font-semibold text-slate-600">{s.label} →</p><p className="mt-1 text-3xl font-extrabold" style={{ color: s.color }}>{s.count}</p><p className="text-xs text-slate-500">{pct(s.count)}% of batch · tap to open</p><div className="mt-3 h-2.5 rounded bg-slate-100"><div className={`h-2.5 rounded ${s.bg}`} style={{ width: `${pct(s.count)}%` }} /></div></button>)}
    </div>
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-600">Segment split</p>
      <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-green-500" style={{ width: `${pct(run.stay_count)}%` }} title={`Stay ${pct(run.stay_count)}%`} />
        <div className="bg-yellow-400" style={{ width: `${pct(run.tends_count)}%` }} title={`Tends ${pct(run.tends_count)}%`} />
        <div className="bg-red-500" style={{ width: `${pct(run.churn_count)}%` }} title={`Churn ${pct(run.churn_count)}%`} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Green = Will Stay · Yellow = Tends to Churn · Red = Will Churn · Churn rate {run.churn_rate}%{run.truncated_items ? " · showing first 2000 rows" : ""}</p>
    </div>

    <h2 className="mt-8 text-xl font-bold text-slate-900">How this batch churns</h2>
    <p className="mt-1 text-sm text-slate-500">Simple reads from this file — same numbers the model saw.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">Churn by contract</p><Bars rows={byContract(run.results)} /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">Churn by tenure</p><Bars rows={byTenure(run.results)} /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">Churn by internet</p><Bars rows={byInternet(run.results)} /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">Risk probability buckets</p><Bars rows={byBuckets(run.results)} /></div>
    </div>

    <div className="mt-6 flex justify-end"><button onClick={() => {
      const csv = "row,customer,probability,risk\n" + run.results.map(r => `${r.row},"${(r.customer_name || "").replace(/"/g, '""')}",${r.probability},${r.risk_category?.label}`).join("\n");
      const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${run.name}-results.csv`; a.click();
    }} className="text-sm font-semibold text-blue-600">Export CSV ↗</button></div>
  </>;
}
