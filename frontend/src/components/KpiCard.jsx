export default function KpiCard({ title, value, trend, icon }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm text-slate-500">{title}</p><span>{icon}</span></div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-2 text-xs text-slate-500">{trend}</p></div>;
}
