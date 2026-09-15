import { useEffect, useState } from "react";
import api from "../services/api";
export default function RecentPredictions() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/api/predict/history").then((r) => setRows(r.data)).catch(() => {});
  }, []);
  if (rows.length === 0) return <div className="panel p-6 text-sm text-slate-500">No recent predictions - run a prediction to see last 3 here.</div>;
  return (
    <div className="panel p-6">
      <h3 className="font-semibold">Last 3 predictions</h3>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="flex justify-between rounded border p-3 text-sm">
            <span>{r.contract} · {r.internet_service} · {r.tenure}m</span>
            <span className={r.churn ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{r.churn_label} {r.probability}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
