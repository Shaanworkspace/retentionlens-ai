import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];

export function ChurnByContract() {
  const data = [{ name: "Month-to-month", value: 42 }, { name: "One year", value: 11 }, { name: "Two year", value: 3 }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} /></BarChart>
    </ResponsiveContainer>
  );
}
export function TenureVsChurn() {
  const data = [{ tenure: "0-12", churn: 47 }, { tenure: "12-24", churn: 29 }, { tenure: "24-48", churn: 20 }, { tenure: "48+", churn: 9 }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}><XAxis dataKey="tenure" /><YAxis /><Tooltip /><Area dataKey="churn" stroke="#ef4444" fill="#fee2e2" /></AreaChart>
    </ResponsiveContainer>
  );
}
export function PaymentMethodPie() {
  const data = [{ name: "Electronic check", value: 45 }, { name: "Mailed check", value: 19 }, { name: "Bank transfer", value: 18 }, { name: "Credit card", value: 18 }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={70} label>{data.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
    </ResponsiveContainer>
  );
}
export function MonthlyChargesDist() {
  const data = [{ range: "0-35", count: 1200 }, { range: "35-65", count: 1800 }, { range: "65-90", count: 2200 }, { range: "90+", count: 1843 }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}><XAxis dataKey="range" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#22c55e" /></BarChart>
    </ResponsiveContainer>
  );
}
export function ChurnTrend() {
  const data = [{ m: "M1", v: 42 }, { m: "M2", v: 55 }, { m: "M3", v: 48 }, { m: "M4", v: 68 }, { m: "M5", v: 57 }, { m: "M6", v: 72 }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}><XAxis dataKey="m" /><YAxis /><Tooltip /><Line dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} /></LineChart>
    </ResponsiveContainer>
  );
}
