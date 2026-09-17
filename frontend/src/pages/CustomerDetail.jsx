import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import CustomerBoard from "../components/CustomerBoard";

const riskOf = (p) => p >= 0.65 ? { id: 3, label: "Will Churn", detail: "Churning - Critical", color: "red", score: "65-100", action: "Immediate intervention" } : p >= 0.4 ? { id: 2, label: "Tends to Churn", detail: "At Risk - Needs Attention", color: "yellow", score: "40-65", action: "Proactive outreach" } : { id: 1, label: "Will Stay", detail: "Not Churn - Positive", color: "green", score: "0-40", action: "Nurture & upsell" };

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/predict/${id}`).then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.detail || "Could not load customer dashboard."));
  }, [id]);

  if (error) return <><Breadcrumbs current="Customer" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p></>;
  if (!data) return <><Breadcrumbs current="Customer" /><p className="text-sm text-slate-500">Loading customer dashboard...</p></>;

  const risk = riskOf(data.probability);
  return <><Breadcrumbs current={data.customer_name || `Customer #${data.id}`} />
    <CustomerBoard title={data.customer_name || `Customer #${data.id}`} subtitle={`Tenure ${data.tenure} months · ${data.contract} · ${data.internet_service}`} backTo="/predict" backLabel="← All customers" probability={data.probability} risk={risk} tenure={data.tenure} contract={data.contract} />
  </>;
}
