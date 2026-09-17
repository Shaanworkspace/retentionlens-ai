import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";
import { fmtDate } from "./BatchHistory";

export default function BatchResult() {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [error, setError] = useState("");
  const [offersMap, setOffersMap] = useState({});
  const [offerLoading, setOfferLoading] = useState({});

  useEffect(() => {
    api.get(`/api/batch/runs/${id}`).then(({ data }) => setRun(data)).catch((e) => setError(e.response?.data?.detail || "Could not load batch analysis."));
  }, [id]);

  const genOffers = async (r) => {
    setOfferLoading((m) => ({ ...m, [r.row]: true }));
    try {
      const { data } = await api.post("/api/retention/offers", r.data);
      setOffersMap((m) => ({ ...m, [r.row]: Array.isArray(data.offers) ? data.offers.join("\n") : data.offers_text }));
    } catch (e) { setOffersMap((m) => ({ ...m, [r.row]: "Error: " + (e.response?.data?.detail || "GenAI failed") })); }
    finally { setOfferLoading((m) => ({ ...m, [r.row]: false })); }
  };

  if (error) return <><Breadcrumbs current="Batch analysis" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to="/batches" className="mt-4 inline-block text-sm text-blue-600">← Back to history</Link></>;
  if (!run) return <><Breadcrumbs current="Batch analysis" /><p className="text-sm text-slate-500">Loading full analysis...</p></>;

  const pct = (n) => run.total ? Math.round((n / run.total) * 100) : 0;
  const seg = [
    { label: "Will Churn", count: run.churn_count, color: "#ef4444", bg: "bg-red-500" },
    { label: "Tends to Churn", count: run.tends_count, color: "#eab308", bg: "bg-yellow-400" },
    { label: "Will Stay", count: run.stay_count, color: "#22c55e", bg: "bg-green-500" },
  ];

  return <><Breadcrumbs current={run.name} />
    <p className="eyebrow">Batch analysis</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{run.filename || run.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{run.name} · {run.source === "s3" ? "S3" : run.source === "paste" ? "Pasted" : "Uploaded"} · {fmtDate(run.created_at)} · {run.total} customers</p></div>
      <Link to="/batches" className="text-sm font-semibold text-blue-600">← All batches</Link>
    </div>

    <h2 className="mt-8 text-xl font-bold text-slate-900">Overall graphs</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      {seg.map((s) => <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-600">{s.label}</p><p className="mt-1 text-3xl font-extrabold" style={{ color: s.color }}>{s.count}</p><p className="text-xs text-slate-500">{pct(s.count)}% of batch</p><div className="mt-3 h-2.5 rounded bg-slate-100"><div className={`h-2.5 rounded ${s.bg}`} style={{ width: `${pct(s.count)}%` }} /></div></div>)}
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

    <h2 className="mt-8 text-xl font-bold text-slate-900">Individual customers</h2>
    <p className="mt-1 text-sm text-slate-500">Every row with its own risk. Generate GenAI offers per customer on demand.</p>
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 border-b bg-white"><tr><th className="p-3">#</th><th className="p-3">Customer</th><th className="p-3">Tenure</th><th className="p-3">Contract</th><th className="p-3">Prob</th><th className="p-3">Risk</th><th className="p-3">Offers</th></tr></thead>
        <tbody>{run.results.map((r) => (
          <tr key={r.row} className="border-b last:border-0 hover:bg-slate-50">
            <td className="p-3">{r.row}</td>
            <td className="p-3 font-medium">{r.customer_name || `Row ${r.row}`}</td>
            <td className="p-3">{r.data?.tenure}m</td>
            <td className="p-3 text-slate-500">{r.data?.Contract}</td>
            <td className="p-3 font-bold" style={{ color: r.risk_category?.color === "red" ? "#ef4444" : r.risk_category?.color === "yellow" ? "#eab308" : "#22c55e" }}>{r.probability}</td>
            <td className="p-3"><span className={`rounded px-2 py-1 text-xs ${r.risk_category?.color === "red" ? "bg-red-100 text-red-700" : r.risk_category?.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{r.risk_category?.label}</span></td>
            <td className="p-3">
              {!offersMap[r.row] ? <button onClick={() => genOffers(r)} disabled={offerLoading[r.row]} className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60">{offerLoading[r.row] && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}{offerLoading[r.row] ? "Generating..." : "Generate offers"}</button>
              : <p className="max-w-[320px] whitespace-pre-line text-xs text-slate-600">{offersMap[r.row]}</p>}
            </td>
          </tr>))}</tbody>
      </table>
    </div>
  </>;
}
