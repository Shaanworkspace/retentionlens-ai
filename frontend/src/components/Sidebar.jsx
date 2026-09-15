import { NavLink } from "react-router-dom";

const items = [["/dashboard", "Dashboard"], ["/customers", "Customers"], ["/predictions", "Predictions"], ["/offers", "Offers"], ["/analytics", "Analytics"], ["/health", "Health Scores"], ["/data", "Data"], ["/settings", "Settings"]];
export default function Sidebar({ open, onClose }) {
  return <aside className={`${open ? "translate-x-0" : "-translate-x-full"} glass-sidebar fixed inset-y-16 left-0 z-20 w-60 p-4 transition-transform md:static md:inset-auto md:translate-x-0`}>
    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/70 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Workspace</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">Demo Telecom</p><p className="mt-1 text-xs text-slate-500">Growth plan</p></div>
    <nav className="space-y-1">{items.map(([to, label]) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}>{label}</NavLink>)}</nav>
    <div className="absolute bottom-5 left-4 right-4 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-xs text-slate-500"><p className="font-semibold text-slate-700">Need a hand?</p><p className="mt-1">Review your data setup and model health.</p></div>
  </aside>;
}
