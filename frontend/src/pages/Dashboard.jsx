import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Breadcrumbs from "../components/Breadcrumbs";
import RecentPredictions from "../components/RecentPredictions";
import { IconUser, IconUsers } from "../components/icons";

function useLiveStats() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  const wave = Math.sin(tick / 3) * 0.4;
  return {
    indiaChurn: (3.8 + wave).toFixed(1),
    prepaidShare: (92 + (tick % 3) * 0.2).toFixed(1),
    mnpRequests: (12.4 + (tick % 5) * 0.3).toFixed(1),
    ruralGrowth: (2.1 + wave * 0.5).toFixed(1),
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const live = useLiveStats();
  return <><Breadcrumbs current="Dashboard" />
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{user?.company || "Your company"}</h1>
      <p className="mt-3 max-w-2xl text-slate-500">Hello {user?.name || "there"} — this is {user?.company || "your company"}'s retention workspace. Live India telecom pulse below.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-5"><p className="text-xs font-semibold text-sky-700">India avg monthly churn</p><p className="mt-1 text-3xl font-extrabold text-slate-900">{live.indiaChurn}%</p><p className="mt-1 flex items-center gap-1 text-xs text-sky-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />live · prepaid base churns faster</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-xs font-semibold text-emerald-700">Prepaid share</p><p className="mt-1 text-3xl font-extrabold text-slate-900">{live.prepaidShare}%</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />live · price-sensitive users</p></div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5"><p className="text-xs font-semibold text-amber-700">MNP requests / month</p><p className="mt-1 text-3xl font-extrabold text-slate-900">{live.mnpRequests}M</p><p className="mt-1 flex items-center gap-1 text-xs text-amber-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />live · port-outs signal churn</p></div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5"><p className="text-xs font-semibold text-violet-700">Rural subscriber growth</p><p className="mt-1 text-3xl font-extrabold text-slate-900">{live.ruralGrowth}%</p><p className="mt-1 flex items-center gap-1 text-xs text-violet-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />live · next battleground</p></div>
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900">What do you want to analyze today?</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <Link to="/predict" className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white"><IconUser className="h-7 w-7" /></span>
          <span><span className="block text-lg font-bold text-slate-900">Single customer</span><span className="mt-1 block text-sm text-slate-500">Enter one customer's details and get an accurate churn risk with reasons.</span></span>
        </Link>
        <Link to="/batch" className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white"><IconUsers className="h-7 w-7" /></span>
          <span><span className="block text-lg font-bold text-slate-900">Batch customers</span><span className="mt-1 block text-sm text-slate-500">Upload, paste, or drag-drop a CSV of up to 5000 customers and score them together.</span></span>
        </Link>
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900">Your analysis history</h2>
      <p className="mt-1 text-sm text-slate-500">Every prediction you have run from this account appears here.</p>
      <div className="mt-4"><RecentPredictions /></div>
    </div>
  </>;
}
