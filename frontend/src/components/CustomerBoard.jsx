import { Link } from "react-router-dom";

export const tierColor = (c) => c === "red" ? "#ef4444" : c === "yellow" ? "#eab308" : "#22c55e";

export default function CustomerBoard({ title, subtitle, backTo, backLabel, probability, risk, tenure, contract }) {
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

    <h2 className="mt-8 text-xl font-bold text-slate-900">Why this score</h2>
    <p className="mt-1 text-sm text-slate-500">Top drivers from this file: month-to-month contracts churn 42%, fiber accounts 41%, tenure under 12 months 47%, electronic-check payments 45%. Long tenure and two-year contracts protect the most.</p>
  </div>;
}
