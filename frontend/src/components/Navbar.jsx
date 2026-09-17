import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { IconMenu, IconBell, IconLogout } from "./icons";

const PRIVATE_PREFIXES = ["/dashboard", "/predict", "/batch", "/offers", "/customers", "/analytics", "/health", "/data", "/settings", "/profile", "/predictions"];

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const { pathname } = useLocation();
  const showMenu = isAuth && PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const [bellOpen, setBellOpen] = useState(false);
  const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return <header className="sticky top-0 z-30 px-4 pt-3 sm:px-6"><div className="glass-header mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl px-4 text-white sm:rounded-full sm:px-6">
    <div className="flex items-center gap-2">
      {showMenu && <button onClick={toggleSidebar} className="glass-control rounded-full border border-white/25 p-2.5 hover:bg-white/20 hover:shadow-md" aria-label="Toggle dashboard menu"><IconMenu /></button>}
      <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm shadow-lg shadow-blue-900/30">R</span>RetentionLens AI</Link>
    </div>
    <div className="flex items-center gap-3">{isAuth ? <>
      <div className="relative">
        <button onClick={() => setBellOpen((v) => !v)} className="glass-control relative rounded-lg p-2 hover:bg-white/20" aria-label="Notifications"><IconBell />{bellOpen ? null : <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}</button>
        {bellOpen && <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="mt-2 space-y-2 text-sm">
            <p className="rounded-lg bg-red-50 p-2">3 high-risk customers need attention today.</p>
            <p className="rounded-lg bg-yellow-50 p-2">12 customers are tending to churn this week.</p>
            <p className="rounded-lg bg-green-50 p-2">Retention offers saved for 5 customers.</p>
          </div>
        </div>}
      </div>
      <Link to="/profile" className="glass-control flex items-center gap-2 rounded-lg px-2 py-1 text-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/80 font-bold">{initials}</span><span className="hidden max-w-32 truncate sm:block">{user?.name || user?.email}</span></Link>
      <button onClick={logout} className="hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white sm:block" aria-label="Logout"><IconLogout /></button>
    </> : <Link to="/login" className="text-sm hover:text-blue-300">Log in</Link>}</div>
  </div></header>;
}
