import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import api from "../services/api";
import { IconSpark, IconCheck } from "../components/icons";
import { logGenAISend, logGenAIReply, logGenAIError } from "../services/genai-log";

const META = {
  churn: { title: "Will Churn", color: "#ef4444", soft: "bg-red-50" },
  tends: { title: "Tends to Churn", color: "#eab308", soft: "bg-yellow-50" },
  stay: { title: "Will Stay", color: "#22c55e", soft: "bg-green-50" },
};

const TIERS = [
  { key: "high", title: "High Alert", desc: "Probability 85% and above — act today" },
  { key: "medium", title: "Medium Alert", desc: "Probability 75% to 85% — act this week" },
  { key: "low", title: "Low Alert", desc: "Probability 65% to 75% — watch closely" },
];

function RowTable({ rows, onOpen }) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-left text-sm">
      <thead className="border-b bg-slate-50"><tr><th className="p-3">#</th><th className="p-3">Customer</th><th className="p-3">Tenure</th><th className="p-3">Contract</th><th className="p-3">Internet</th><th className="p-3">Prob</th><th className="p-3">Risk</th><th className="p-3"></th></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.row} onClick={() => onOpen(r)} className="cursor-pointer border-b last:border-0 hover:bg-blue-50/50">
          <td className="p-3 text-slate-400">{r.row}</td>
          <td className="p-3 font-bold text-slate-900">{r.customer_name || `Row ${r.row}`}{r.offered_index != null && <span className="ml-2 text-xs font-normal text-green-600">Offered ✓</span>}</td>
          <td className="p-3">{r.data?.tenure}m</td>
          <td className="p-3 text-slate-500">{r.data?.Contract}</td>
          <td className="p-3 text-slate-500">{r.data?.InternetService}</td>
          <td className="p-3 font-extrabold" style={{ color: META[r.risk_category?.id === 3 ? "churn" : r.risk_category?.id === 2 ? "tends" : "stay"].color }}>{Math.round(r.probability * 100)}%</td>
          <td className="p-3"><span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: META[r.risk_category?.id === 3 ? "churn" : r.risk_category?.id === 2 ? "tends" : "stay"].color + "20", color: META[r.risk_category?.id === 3 ? "churn" : r.risk_category?.id === 2 ? "tends" : "stay"].color }}>{r.risk_category?.label}</span></td>
          <td className="p-3 text-blue-600">Open →</td>
        </tr>))}</tbody>
    </table>
  </div>;
}

function TierOffers({ tierKey, tierTitle, rows }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offeredIdx, setOfferedIdx] = useState(null);

  const generate = async () => {
    if (!rows.length) return;
    setLoading(true); setError(""); setOfferedIdx(null);
    const sorted = [...rows].sort((a, b) => b.probability - a.probability);
    const mid = sorted[Math.floor(sorted.length / 2)] || sorted[0];
    const contracts = {};
    sorted.forEach((r) => { contracts[r.data?.Contract || "Month-to-month"] = (contracts[r.data?.Contract || "Month-to-month"] || 0) + 1; });
    const topContract = Object.entries(contracts).sort((a, b) => b[1] - a[1])[0][0];
    const avgTenure = Math.round(sorted.reduce((s, r) => s + Number(r.data?.tenure || 0), 0) / sorted.length);
    const avgProb = sorted.reduce((s, r) => s + Number(r.probability || 0), 0) / sorted.length;
    const rep = { ...mid.data, Contract: topContract, tenure: avgTenure, churn_prob: avgProb, risk_label: `${tierTitle} band (${sorted.length} customers)`, risk_detail: `Generalized offer for the whole ${tierTitle} group` };
    try {
      logGenAISend({ endpoint: "POST /api/retention/offers", tier: tierTitle, customers: sorted.length, payload: rep });
      const { data } = await api.post("/api/retention/offers", rep);
      logGenAIReply({ offers_count: data.offers?.length, offers: data.offers, prompt_sent_to_gemini: data.prompt });
      setOffers(data.offers && data.offers.length ? data.offers : []);
    } catch (e) { logGenAIError(e); setError(e.response?.data?.detail || "GenAI offer failed."); }
    finally { setLoading(false); }
  };

  return <div className="mt-4 rounded-xl bg-slate-50 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-semibold text-slate-700">Generalized offers for all of {tierTitle} ({rows.length} customers)</p>
      <button onClick={generate} disabled={loading} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60 flex items-center gap-2">{loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}{loading ? "Asking GenAI..." : `Generate ${tierTitle} offers`}</button>
    </div>
    {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    {offers.length > 0 && <div className="mt-3 grid gap-3 md:grid-cols-3">
      {offers.map((o, i) => <div key={i} className={`rounded-xl border bg-white p-4 ${offeredIdx === i ? "border-green-400" : "border-slate-200"}`}>
        <p className="flex items-center gap-2 text-xs font-bold"><IconSpark className="h-4 w-4 text-amber-500" />Offer {i + 1}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{o}</p>
        <button onClick={() => setOfferedIdx(i)} className={`mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold ${offeredIdx === i ? "bg-green-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{offeredIdx === i ? <><IconCheck className="h-3 w-3" />Offered ✓</> : "Mark as Offered"}</button>
      </div>)}
    </div>}
  </div>;
}

export default function SegmentPage() {
  const { id, seg } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const meta = META[seg] || META.churn;
  const open = (r) => navigate(`/batch/${id}/customer/${r.row}`);

  useEffect(() => {
    api.get(`/api/batch/runs/${id}/segment/${seg}`).then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.detail || "Could not load segment."));
  }, [id, seg]);

  if (error) return <><Breadcrumbs current="Segment" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to={`/batch/${id}`} className="mt-4 inline-block text-sm text-blue-600">← Back to batch</Link></>;
  if (!data) return <><Breadcrumbs current="Segment" /><p className="text-sm text-slate-500">Loading segment...</p></>;

  return <><Breadcrumbs current={meta.title} />
    <p className="eyebrow">Segment · {data.run_name}</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{meta.title} <span className="text-xl" style={{ color: meta.color }}>· {data.total}</span></h1>
      <Link to={`/batch/${id}`} className="text-sm font-semibold text-blue-600">← Back to batch</Link>
    </div>

    {seg === "churn" ? <div className="mt-6 space-y-6">
      {TIERS.map((t) => <div key={t.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-xl font-bold text-slate-900">{t.title} · {(data.tiers?.[t.key] || []).length}</h2><p className="mt-0.5 text-sm text-slate-500">{t.desc} — every row below is clickable and opens that customer's full dashboard.</p></div>
        </div>
        <div className="mt-4"><RowTable rows={data.tiers?.[t.key] || []} onOpen={open} /></div>
        {(data.tiers?.[t.key] || []).length === 0 && <p className="mt-3 text-sm text-slate-400">Nobody in this alert band.</p>}
        {(data.tiers?.[t.key] || []).length > 0 && <TierOffers tierKey={t.key} tierTitle={t.title} rows={data.tiers[t.key]} />}
      </div>)}
    </div> : <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm text-slate-500">Every row is clickable and opens that customer's full dashboard.</p>
      <div className="mt-4"><RowTable rows={data.results} onOpen={open} /></div>
    </div>}
  </>;
}
