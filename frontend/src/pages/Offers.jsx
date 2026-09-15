import { useState } from "react";
import api from "../services/api";
export default function Offers() {
  const [form] = useState({ tenure: 8, MonthlyCharges: 85.5, TotalCharges: 600, gender: "Female", Partner: "No", Dependents: "No", PhoneService: "Yes", MultipleLines: "Yes", InternetService: "Fiber optic", OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No", TechSupport: "No", StreamingTV: "Yes", StreamingMovies: "Yes", Contract: "Month-to-month", PaperlessBilling: "Yes", PaymentMethod: "Electronic check" });
  const [data, setData] = useState(null);
  const run = async () => {
    const { data } = await api.post("/api/retention/offers", form);
    setData(data);
  };
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 border rounded bg-white">
      <h2 className="text-2xl font-bold">Retention Offers (GenAI)</h2>
      <button onClick={run} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Generate Offers</button>
      {data && <div className="mt-4 p-4 bg-slate-50 rounded whitespace-pre-line"><p>Churn: {data.churn_label} ({data.probability})</p><p className="mt-2 font-semibold">Offers:</p><p>{data.offers}</p><p className="mt-2 text-sm text-slate-500">History used: {data.history_used.join(" | ")}</p></div>}
    </div>
  );
}
