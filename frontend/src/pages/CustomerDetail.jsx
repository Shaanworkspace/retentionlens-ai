import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import { IconSpark, IconCheck, IconX } from "../components/icons";

const tierColor = (c) => c === "red" ? "#ef4444" : c === "yellow" ? "#eab308" : "#22c55e";
const riskOf = (p) => p >= 0.65 ? { id: 3, label: "Will Churn", detail: "Churning - Critical", color: "red", score: "65-100", action: "Immediate intervention" } : p >= 0.4 ? { id: 2, label: "Tends to Churn", detail: "At Risk - Needs Attention", color: "yellow", score: "40-65", action: "Proactive outreach" } : { id: 1, label: "Will Stay", detail: "Not Churn - Positive", color: "green", score: "0-40", action: "Nurture & upsell" };

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offeredIdx, setOfferedIdx] = useState(null);
  const [savedPct, setSavedPct] = useState(null);

  useEffect(() => {
    api.get(`/api/predict/${id}`).then(({ data }) => {
      setData(data);
      setOfferedIdx(data.offered_index ?? null);
      if (data.offers) {
        try {
          const parsed = JSON.parse(data.offers);
          if (Array.isArray(parsed)) setOffers(parsed);
        } catch { /* plain text stored */ }
      }
    }).catch((e) => setError(e.response?.data?.detail || "Could not load customer dashboard."));
  }, [id]);

  const genOffers = async () => {
    setOfferLoading(true); setOfferError("");
    try {
      const { data: fresh } = await api.get(`/api/predict/${id}`);
      const { data } = await api.post("/api/retention/offers", {
        customer_name: fresh.customer_name, tenure: fresh.tenure, MonthlyCharges: fresh.monthly_charges, TotalCharges: fresh.total_charges,
        gender: "Male", Partner: "No", Dependents: "No", PhoneService: "Yes", MultipleLines: "No",
        InternetService: fresh.internet_service, OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No",
        TechSupport: "No", StreamingTV: "No", StreamingMovies: "No", Contract: fresh.contract,
        PaperlessBilling: "Yes", PaymentMethod: fresh.payment_method,
      });
      setOffers(data.offers && data.offers.length ? data.offers : []);
      setOfferedIdx(null); setSavedPct(null);
    } catch (e) { setOfferError(e.response?.data?.detail || "Offer generation failed."); }
    finally { setOfferLoading(false); }
  };

  const markOffered = async (idx) => {
    try {
      const { data } = await api.patch(`/api/predict/${id}/outcome`, { offered_index: idx });
      setOfferedIdx(data.offered_index);
      setSavedPct(data.retention_chance);
    } catch {}
  };

  if (error) return <><Breadcrumbs current="Customer" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to="/predict" className="mt-4 inline-block text-sm text-blue-600">← Back to customers</Link></>;
  if (!data) return <><Breadcrumbs current="Customer" /><p className="text-sm text-slate-500">Loading customer dashboard...</p></>;

  const risk = riskOf(data.probability);
  return <><Breadcrumbs current={data.customer_name || `Customer #${data.id}`} />
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="eyebrow">Customer dashboard</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{data.customer_name || `Customer #${data.id}`}</h1>
        <p className="mt-1 text-sm text-slate-500">Tenure {data.tenure} months · {data.contract} · {data.internet_service}</p></div>
        <Link to="/predict" className="text-sm font-semibold text-blue-600">← All customers</Link>
      </div>

      <div className="mt-6 rounded-2xl p-5 text-white" style={{ background: tierColor(risk.color) }}>
        <p className="text-sm opacity-90">{risk.detail}</p>
        <p className="text-3xl font-extrabold">{risk.label} · {Math.round(data.probability * 100)}%</p>
        <p className="text-sm opacity-90">{risk.action}</p>
      </div>

      <h2 className="mt-8 text-xl font-bold text-slate-900">Risk graphs</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Churn probability</p><div className="mt-3 h-3 rounded bg-slate-200"><div className="h-3 rounded" style={{ width: `${data.probability * 100}%`, background: tierColor(risk.color) }} /></div><p className="mt-2 text-xs text-slate-500">{Math.round(data.probability * 100)} out of 100 — model output</p></div>
        <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Risk meter</p><div className="mt-3 flex gap-2">{[1, 2, 3].map((i) => <div key={i} className="h-3 flex-1 rounded" style={{ background: i <= risk.id ? tierColor(risk.color) : "#e2e8f0" }} />)}</div><p className="mt-2 text-xs text-slate-500">Tier {risk.id} of 3 · Score band {risk.score}</p></div>
        <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Tenure vs churn</p><div className="mt-3 h-3 rounded bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" /><div className="relative h-4"><div className="absolute top-0 h-4 w-1 rounded bg-slate-900" style={{ left: `${Math.min(100, (data.tenure / 72) * 100)}%` }} /></div><p className="text-xs text-slate-500">This customer at {data.tenure} months — 0 to 12 month accounts churn 47%</p></div>
        <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Contract risk across base</p><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between"><span>Month-to-month</span><span className="font-bold text-red-600">42%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-red-500" style={{ width: "42%" }} /></div><div className="flex justify-between"><span>One year</span><span className="font-bold text-yellow-600">11%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-yellow-400" style={{ width: "11%" }} /></div><div className="flex justify-between"><span>Two year</span><span className="font-bold text-green-600">3%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-green-500" style={{ width: "3%" }} /></div></div></div>
      </div>

      <h2 className="mt-8 text-xl font-bold text-slate-900">Retention offers</h2>
      <p className="mt-1 text-sm text-slate-500">Tap generate — a live GenAI request runs and at least 3 offers appear. Click any offer to mark it offered for this customer.</p>
      <button onClick={genOffers} disabled={offerLoading} className="primary-button mt-4 hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2">{offerLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{offerLoading ? "Asking GenAI..." : "Generate offers with GenAI"}</button>
      {offerError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{offerError}</p>}
      {offers.length > 0 && <div className="mt-4 grid gap-4 md:grid-cols-3">
        {offers.map((offer, idx) => <div key={idx} className={`rounded-2xl border p-5 ${offeredIdx === idx ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}>
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900"><IconSpark className="h-4 w-4 text-amber-500" />Offer {idx + 1}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{offer}</p>
          <button onClick={() => markOffered(idx)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${offeredIdx === idx ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`}>{offeredIdx === idx ? <><IconCheck className="h-4 w-4" />Offered ✓</> : "Mark as Offered"}</button>
        </div>)}
      </div>}
      {savedPct != null && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">Saved — this customer's retention chance is now {savedPct}%.</p>}
    </div>
  </>;
}
