import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import KpiCard from "../components/KpiCard";
import HealthDot from "../components/HealthDot";
import RecentPredictions from "../components/RecentPredictions";
import { ChurnByContract, TenureVsChurn, PaymentMethodPie, MonthlyChargesDist, ChurnTrend } from "../components/Charts";

const rows = [["Northstar Labs", 45, "Fiber", "78%", "₹89"], ["Acme Systems", 72, "DSL", "24%", "₹120"], ["Pioneer Telecom", 61, "Fiber", "52%", "₹97"], ["Orbit Networks", 38, "Fiber", "84%", "₹76"]];
export default function Dashboard() {
  return <><Breadcrumbs current="Dashboard" /><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Command center</p><h1 className="page-title mt-1">Customer retention overview</h1><p className="page-subtitle">Monitor account health and act on churn risk with a clear, focused workspace.</p></div><Link to="/predict" className="primary-button text-center">Analyze customer</Link></div>
    <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"><KpiCard title="Total Customers" value="7,043" trend="+4.8% this month" icon="◉" /><KpiCard title="At-Risk" value="1,863" trend="26.4% of portfolio" icon="●" /><KpiCard title="MRR at Risk" value="₹12.4L" trend="₹89 average account" icon="₹" /><KpiCard title="Avg Health Score" value="68/100" trend="+6 points this quarter" icon="◒" /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="panel p-6"><h2 className="font-semibold">Churn Trend · Last 6 months</h2><div className="mt-4"><ChurnTrend /></div></div>
      <div className="panel p-6"><h2 className="font-semibold">Churn by Contract</h2><div className="mt-4"><ChurnByContract /></div></div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="panel p-6"><h2 className="font-semibold">Tenure vs Churn (%)</h2><div className="mt-4"><TenureVsChurn /></div></div>
      <div className="panel p-6"><h2 className="font-semibold">Payment Method Distribution</h2><div className="mt-4"><PaymentMethodPie /></div></div>
    </div>
    <div className="mt-6 panel p-6"><h2 className="font-semibold">Monthly Charges Distribution (count)</h2><div className="mt-4"><MonthlyChargesDist /></div></div>
    <div className="mt-6"><RecentPredictions /></div>
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">At-risk customers</h2><p className="mt-1 text-sm text-slate-500">Top 20 accounts needing attention.</p></div><div className="flex gap-2"><input className="field max-w-xs" placeholder="🔍 Search" aria-label="Search at-risk customers" /><select className="field w-auto"><option>All contracts</option><option>Fiber</option><option>DSL</option></select><button className="rounded-lg border border-slate-200 px-3">↗</button></div></div><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr>{["Name", "Health", "Plan", "Churn Prob", "MRR", "Action"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody>{rows.map(([name, score, plan, probability, mrr]) => <tr key={name} className="border-b last:border-0 hover:bg-slate-50"><td className="px-3 py-4 font-medium">{name}</td><td className="px-3 py-4"><HealthDot score={score} /></td><td className="px-3 py-4 text-slate-500">{plan}</td><td className="px-3 py-4 font-semibold text-red-500">{probability}</td><td className="px-3 py-4">{mrr}</td><td className="px-3 py-4"><Link to="/offers" className="text-blue-600">View · Offer</Link></td></tr>)}</tbody></table></div><div className="mt-4 flex justify-between text-sm text-slate-500"><span>Showing 1–4 of 1,863</span><span className="space-x-3"><button>Prev</button><button className="font-semibold text-blue-600">Next</button></span></div></section></>;
}
