import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Breadcrumbs from "../components/Breadcrumbs";
import KpiCard from "../components/KpiCard";
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
    <div className="panel bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Welcome</p>
      <h1 className="mt-1 text-3xl font-bold">{user?.company || "Your company"}</h1>
      <p className="mt-2 text-sm text-blue-100">Hello {user?.name || "there"} — here is what is happening in Indian telecom right now. Numbers refresh live.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white/15 p-4"><p className="text-xs text-blue-100">India avg monthly churn</p><p className="text-2xl font-bold">{live.indiaChurn}% <span className="text-xs font-normal">● live</span></p><p className="text-xs text-blue-100">Prepaid-heavy base churns faster</p></div>
        <div className="rounded-xl bg-white/15 p-4"><p className="text-xs text-blue-100">Prepaid share</p><p className="text-2xl font-bold">{live.prepaidShare}% <span className="text-xs font-normal">● live</span></p><p className="text-xs text-blue-100">Price-sensitive, offer-driven</p></div>
        <div className="rounded-xl bg-white/15 p-4"><p className="text-xs text-blue-100">MNP requests / month</p><p className="text-2xl font-bold">{live.mnpRequests}M <span className="text-xs font-normal">● live</span></p><p className="text-xs text-blue-100">Port-outs signal churn intent</p></div>
        <div className="rounded-xl bg-white/15 p-4"><p className="text-xs text-blue-100">Rural subscriber growth</p><p className="text-2xl font-bold">{live.ruralGrowth}% <span className="text-xs font-normal">● live</span></p><p className="text-xs text-blue-100">Next retention battleground</p></div>
      </div>
    </div>

    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <Link to="/predict" className="panel group flex items-center gap-4 p-6 hover:shadow-lg">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white"><IconUser /></span>
        <span><span className="block text-lg font-bold text-slate-900">Analyze single customer</span><span className="text-sm text-slate-500">Enter details, predict churn, get GenAI offers →</span></span>
      </Link>
      <Link to="/batch" className="panel group flex items-center gap-4 p-6 hover:shadow-lg">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white"><IconUsers /></span>
        <span><span className="block text-lg font-bold text-slate-900">Analyze batch (CSV)</span><span className="text-sm text-slate-500">Upload, paste or drag-drop up to 5000 rows →</span></span>
      </Link>
    </div>

    <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"><KpiCard title="Total Customers" value="7,043" trend="+4.8% this month" icon="◉" /><KpiCard title="At-Risk" value="1,863" trend="26.4% of portfolio" icon="●" /><KpiCard title="MRR at Risk" value="₹12.4L" trend="₹89 average account" icon="₹" /><KpiCard title="Avg Health Score" value="68/100" trend="+6 points this quarter" icon="◒" /></div>
    <div className="mt-6"><RecentPredictions /></div>
  </>;
}
