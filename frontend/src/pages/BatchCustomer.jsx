import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import CustomerBoard from "../components/CustomerBoard";

export default function BatchCustomer() {
  const { id, row } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/batch/runs/${id}/items/${row}`).then(({ data }) => setData(data)).catch((e) => setError(e.response?.data?.detail || "Could not load customer dashboard."));
  }, [id, row]);

  if (error) return <><Breadcrumbs current="Customer" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to={`/batch/${id}`} className="mt-4 inline-block text-sm text-blue-600">← Back to batch</Link></>;
  if (!data) return <><Breadcrumbs current="Customer" /><p className="text-sm text-slate-500">Loading customer dashboard...</p></>;

  return <><Breadcrumbs current={data.customer_name || `Row ${data.row}`} />
    <CustomerBoard title={data.customer_name || `Row ${data.row} · ${data.run_name}`} subtitle={`Batch ${data.run_name} · Tenure ${data.data?.tenure}m · ${data.data?.Contract} · ${data.data?.InternetService}`} backTo={`/batch/${id}`} backLabel="← Back to batch" probability={data.probability} risk={data.risk_category} tenure={data.data?.tenure || 0} contract={data.data?.Contract} />
  </>;
}
