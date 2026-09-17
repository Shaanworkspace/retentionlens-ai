import { Link } from "react-router-dom";
import { IconSpark, IconCheck } from "./icons";

export const tierColor = (c) => c === "red" ? "#ef4444" : c === "yellow" ? "#eab308" : "#22c55e";

export default function CustomerBoard({ title, subtitle, backTo, backLabel, probability, risk, tenure, contract, offers, offeredIdx, savedPct, offerLoading, offerError, onGenerate, onOffered }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="eyebrow">Customer dashboard</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      {backTo && <Link to={backTo} className="text-sm font-semibold text-blue-600">{backLabel || "← Back"}</Link>}
    </div>

    <div className="mt-6 rounded-2xl p-5 text-white" style={{ background: tierColor(risk.color) }}>
      <p className="text-sm opacity-90">{risk.detail}</p>
      <p className="text-3xl font-extrabold">{risk.label} · {Math.round(probability * 100)}%</p>
      <p className="text-sm opacity-90">{risk.action}</p>
    </div>

    <h2 className="mt-8 text-xl font-bold text-slate-900">Risk graphs</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Churn probability</p><div className="mt-3 h-3 rounded bg-slate-200"><div className="h-3 rounded" style={{ width: `${probability * 100}%`, background: tierColor(risk.color) }} /></div><p className="mt-2 text-xs text-slate-500">{Math.round(probability * 100)} out of 100 — model output</p></div>
      <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Risk meter</p><div className="mt-3 flex gap-2">{[1, 2, 3].map((i) => <div key={i} className="h-3 flex-1 rounded" style={{ background: i <= risk.id ? tierColor(risk.color) : "#e2e8f0" }} />)}</div><p className="mt-2 text-xs text-slate-500">Tier {risk.id} of 3 · Score band {risk.score}</p></div>
      <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Tenure vs churn</p><div className="mt-3 h-3 rounded bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" /><div className="relative h-4"><div className="absolute top-0 h-4 w-1 rounded bg-slate-900" style={{ left: `${Math.min(100, (tenure / 72) * 100)}%` }} /></div><p className="text-xs text-slate-500">This customer at {tenure} months — 0 to 12 month accounts churn 47%</p></div>
      <div className="rounded-2xl border border-slate-200 p-5"><p className="text-sm font-semibold">Contract risk across base</p><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between"><span>Month-to-month</span><span className="font-bold text-red-600">42%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-red-500" style={{ width: "42%" }} /></div><div className="flex justify-between"><span>One year</span><span className="font-bold text-yellow-600">11%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-yellow-400" style={{ width: "11%" }} /></div><div className="flex justify-between"><span>Two year</span><span className="font-bold text-green-600">3%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-green-500" style={{ width: "3%" }} /></div></div></div>
    </div>

    <h2 className="mt-8 text-xl font-bold text-slate-900">Retention offers</h2>
    <p className="mt-1 text-sm text-slate-500">Tap generate — a live GenAI request runs and 2 to 3 offers appear. Click any offer to mark it offered.</p>
    <button onClick={onGenerate} disabled={offerLoading} className="primary-button mt-4 hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2">{offerLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}{offerLoading ? "Asking GenAI..." : "Generate offers with GenAI"}</button>
    {offerError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{offerError}</p>}
    {offers.length > 0 && <div className="mt-4 grid gap-4 md:grid-cols-3">
      {offers.map((offer, idx) => <div key={idx} className={`rounded-2xl border p-5 ${offeredIdx === idx ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}>
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900"><IconSpark className="h-4 w-4 text-amber-500" />Offer {idx + 1}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{offer}</p>
        <button onClick={() => onOffered(idx)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${offeredIdx === idx ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`}>{offeredIdx === idx ? <><IconCheck className="h-4 w-4" />Offered ✓</> : "Mark as Offered"}</button>
      </div>)}
    </div>}
    {savedPct != null && <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">Saved — retention chance now {savedPct}%.</p>}
  </div>;
}
