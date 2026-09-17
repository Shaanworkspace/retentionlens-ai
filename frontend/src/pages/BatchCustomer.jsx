import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import CustomerBoard from "../components/CustomerBoard";
import { logGenAISend, logGenAIReply, logGenAIError } from "../services/genai-log";

export default function BatchCustomer() {
  const { id, row } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offeredIdx, setOfferedIdx] = useState(null);
  const [savedPct, setSavedPct] = useState(null);

  useEffect(() => {
    api.get(`/api/batch/runs/${id}/items/${row}`).then(({ data }) => {
      setData(data);
      setOfferedIdx(data.offered_index ?? null);
    }).catch((e) => setError(e.response?.data?.detail || "Could not load customer dashboard."));
  }, [id, row]);

  const genOffers = async () => {
    setOfferLoading(true); setOfferError("");
    try {
      logGenAISend({ endpoint: "POST /api/retention/offers", customer: data.customer_name || `Row ${data.row}`, payload: data.data });
      const { data: res } = await api.post("/api/retention/offers", data.data);
      logGenAIReply({ offers_count: res.offers?.length, offers: res.offers, prompt_sent_to_gemini: res.prompt });
      setOffers(res.offers && res.offers.length ? res.offers : []);
      setOfferedIdx(null); setSavedPct(null);
    } catch (e) { logGenAIError(e); setOfferError(e.response?.data?.detail || "Offer generation failed."); }
    finally { setOfferLoading(false); }
  };

  const markOffered = async (idx) => {
    try {
      const { data: res } = await api.patch(`/api/batch/items/${data.id}/outcome`, { offered_index: idx });
      setOfferedIdx(res.offered_index);
      setSavedPct(res.retention_chance);
    } catch {}
  };

  if (error) return <><Breadcrumbs current="Customer" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p><Link to={`/batch/${id}`} className="mt-4 inline-block text-sm text-blue-600">← Back to batch</Link></>;
  if (!data) return <><Breadcrumbs current="Customer" /><p className="text-sm text-slate-500">Loading customer dashboard...</p></>;

  return <><Breadcrumbs current={data.customer_name || `Row ${data.row}`} />
    <CustomerBoard title={data.customer_name || `Row ${data.row} · ${data.run_name}`} subtitle={`Batch ${data.run_name} · Tenure ${data.data?.tenure}m · ${data.contract}`} backTo={`/batch/${id}`} backLabel="← Back to batch" probability={data.probability} risk={data.risk_category} tenure={data.data?.tenure || data.tenure} contract={data.contract} offers={offers} offeredIdx={offeredIdx} savedPct={savedPct} offerLoading={offerLoading} offerError={offerError} onGenerate={genOffers} onOffered={markOffered} />
  </>;
}
