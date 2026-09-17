import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Breadcrumbs from "../components/Breadcrumbs";
import { IconBuilding, IconUser } from "../components/icons";

export default function Profile() {
  const { user, logout } = useAuth();
  const name = user?.name || "Account owner";
  const company = user?.company || "Telecom company";
  const email = user?.email || "";
  const initials = (name?.[0] || "U").toUpperCase();

  return <><Breadcrumbs current="Profile Settings" />
    <div className="panel overflow-hidden">
      <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="-mt-16 flex h-28 w-28 items-center justify-center rounded-3xl bg-white text-4xl font-bold text-indigo-600 shadow-lg ring-4 ring-white">{initials}</span>
        <div><h1 className="text-3xl font-bold text-slate-900">{name}</h1><p className="mt-1 flex items-center gap-2 text-slate-600"><IconBuilding className="h-4 w-4" />{company}</p><p className="text-sm text-slate-500">{email}</p></div>
      </div>
      <div className="grid gap-4 border-t border-slate-100 p-6 sm:grid-cols-3 sm:p-8">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Company</p><p className="mt-1 font-semibold">{company}</p><p className="text-xs text-slate-500">Telecom · India</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</p><p className="mt-1 font-semibold">New Delhi, India</p><p className="text-xs text-slate-500">Update from settings anytime</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p><p className="mt-1 flex items-center gap-2 font-semibold"><IconUser className="h-4 w-4" />Account owner</p><p className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active session</p></div>
      </div>
      <div className="flex gap-3 border-t border-slate-100 p-6"><Link to="/dashboard" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Back to dashboard</Link><button onClick={logout} className="rounded-lg border px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Log out</button></div>
    </div>
  </>;
}
