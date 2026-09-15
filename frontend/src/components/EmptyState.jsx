export default function EmptyState({ title, action }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center"><div className="text-4xl">□</div><p className="mt-3 font-semibold text-slate-800">{title}</p>{action && <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{action}</button>}</div>;
}
