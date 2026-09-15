export default function Breadcrumbs({ current }) {
  return <p className="mb-3 text-xs text-slate-500">Dashboard <span className="px-2">›</span> {current}</p>;
}
