import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { IconHome, IconUser, IconUsers, IconTag, IconChart, IconSettings, IconX } from "./icons";

const items = [
  ["/dashboard", "Dashboard", IconHome],
  ["/predict", "Single Customer", IconUser],
  ["/batch", "Batch Customers", IconUsers],
  ["/offers", "Offers", IconTag],
  ["/analytics", "Analytics", IconChart],
  ["/profile", "Profile Settings", IconSettings],
];

export default function Sidebar() {
  const { user } = useAuth();
  const { sidebarOpen, closeSidebar } = useUI();
  const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return <>
    {sidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 z-20 bg-slate-900/30 transition-opacity" aria-hidden="true" />}
    <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} glass-sidebar fixed inset-y-16 left-0 z-20 w-64 p-4 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">{initials}</span>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{user?.name || "Member"}</p><p className="truncate text-xs text-slate-500">{user?.company || "Telecom"}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div>
        </div>
        <button onClick={closeSidebar} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close menu"><IconX /></button>
      </div>
      <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">ID · {user?.company || "Workspace"} member</div>
      <nav className="mt-4 space-y-1">{items.map(([to, label, Icon]) => <NavLink key={to} to={to} onClick={closeSidebar} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}><Icon className="h-4 w-4" />{label}</NavLink>)}</nav>
    </aside>
  </>;
}
