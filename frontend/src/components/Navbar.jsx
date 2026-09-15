import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const initials = user?.email?.[0]?.toUpperCase() || "U";
  return <header className="sticky top-0 z-30 px-4 pt-3 sm:px-6"><div className="glass-header mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl px-4 text-white sm:rounded-full sm:px-6">
    <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm shadow-lg shadow-blue-900/30">R</span>RetentionLens AI</Link>
    {isAuth && <div className="hidden w-80 md:block"><input className="glass-input w-full rounded-lg px-4 py-2 text-sm text-white placeholder:text-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30" placeholder="Search workspace · Ctrl+K" aria-label="Search workspace" /></div>}
    <div className="flex items-center gap-4">{isAuth ? <><button className="glass-control relative rounded-lg px-2 py-1 text-xl" aria-label="Notifications">🔔<span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-red-500" /></button><Link to="/profile" className="glass-control flex items-center gap-2 rounded-lg px-2 py-1 text-sm"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/80 font-bold">{initials}</span><span className="hidden max-w-32 truncate sm:block">{user?.email}</span></Link><button onClick={logout} className="hidden rounded-lg px-2 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white sm:block">Logout</button></> : <Link to="/login" className="text-sm hover:text-blue-300">Log in</Link>}</div>
  </div></header>;
}
