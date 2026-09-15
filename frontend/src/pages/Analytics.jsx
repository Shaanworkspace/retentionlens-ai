import Breadcrumbs from "../components/Breadcrumbs";
import { ChurnByContract, TenureVsChurn, PaymentMethodPie, MonthlyChargesDist, ChurnTrend } from "../components/Charts";
export default function Analytics() {
  return <><Breadcrumbs current="Analytics" /><p className="eyebrow">Insights</p><h1 className="page-title mt-1">Analytics</h1><p className="page-subtitle">Explore customer behavior and model performance - all charts linked to IBM Telco EDA.</p>
    <div className="mt-6 flex gap-2 border-b border-slate-200"><button className="border-b-2 border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600">EDA</button><button className="px-4 py-3 text-sm text-slate-500">Cohort</button><button className="px-4 py-3 text-sm text-slate-500">Model Metrics</button></div>
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <div className="panel p-6"><h2 className="font-semibold">Churn by Contract</h2><div className="mt-4"><ChurnByContract /></div></div>
      <div className="panel p-6"><h2 className="font-semibold">Tenure vs Churn (%)</h2><div className="mt-4"><TenureVsChurn /></div></div>
      <div className="panel p-6"><h2 className="font-semibold">Payment Method Split</h2><div className="mt-4"><PaymentMethodPie /></div></div>
      <div className="panel p-6"><h2 className="font-semibold">Monthly Charges Distribution</h2><div className="mt-4"><MonthlyChargesDist /></div></div>
      <div className="panel p-6 sm:col-span-2"><h2 className="font-semibold">Churn Trend (6 months)</h2><div className="mt-4"><ChurnTrend /></div></div>
    </div></>;
}
