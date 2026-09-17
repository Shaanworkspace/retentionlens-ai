import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import CustomerBoard from "../components/CustomerBoard";
import { logGenAISend, logGenAIReply, logGenAIError } from "../services/genai-log";

const riskOf = (p) => p >= 0.65 ? { id: 3, label: "Will Churn", detail: "Churning - Critical", color: "red", score: "65-100", action: "Immediate intervention" } : p >= 0.4 ? { id: 2, label: "Tends to Churn", detail: "At Risk - Needs Attention", color: "yellow", score: "40-65", action: "Proactive outreach" } : { id: 1, label: "Will Stay", detail: "Not Churn - Positive", color: "green", score: "0-40", action: "Nurture & upsell" };

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offeredIdx, setOfferedIdx] = useState(null);
  const [savedPct, setSavedPct] = useState(null);

  useEffect(() => {
    api.get(`/api/predict/${id}`).then(({ data }) => {
      setData(data);
      setOfferedIdx(data.offered_index ?? null);
      if (data.offers) {
        try {
          const parsed = JSON.parse(data.offers);
          if (Array.isArray(parsed)) setOffers(parsed);
        } catch { /* plain text stored */ }
      }
    }).catch((e) => setError(e.response?.data?.detail || "Could not load customer dashboard."));
  }, [id]);

  const genOffers = async () => {
    setOfferLoading(true); setOfferError("");
    try {
      const { data: fresh } = await api.get(`/api/predict/${id}`);
      const payload = {
        customer_name: fresh.customer_name, tenure: fresh.tenure, MonthlyCharges: fresh.monthly_charges, TotalCharges: fresh.total_charges,
        gender: "Male", Partner: "No", Dependents: "No", PhoneService: "Yes", MultipleLines: "No",
        InternetService: fresh.internet_service, OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No",
        TechSupport: "No", StreamingTV: "No", StreamingMovies: "No", Contract: fresh.contract,
        PaperlessBilling: "Yes", PaymentMethod: fresh.payment_method,
      };
      logGenAISend({ endpoint: "POST /api/retention/offers", customer: payload.customer_name, payload });
      const { data } = await api.post("/api/retention/offers", payload);
      logGenAIReply({ prediction_id: data.prediction_id, risk: data.risk_category?.label, offers_count: data.offers?.length, offers: data.offers, prompt_sent_to_gemini: data.prompt });
      setOffers(data.offers && data.offers.length ? data.offers : []);
      setOfferedIdx(null); setSavedPct(null);
    } catch (e) { logGenAIError(e); setOfferError(e.response?.data?.detail || "Offer generation failed."); }
    finally { setOfferLoading(false); }
  };

  const markOffered = async (idx) => {
    try {
      const { data } = await api.patch(`/api/predict/${id}/outcome`, { offered_index: idx });
      setOfferedIdx(data.offered_index);
      setSavedPct(data.retention_chance);
    } catch {}
  };

  if (error) return <><Breadcrumbs current="Customer" /><p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p></>;
  if (!data) return <><Breadcrumbs current="Customer" /><p className="text-sm text-slate-500">Loading customer dashboard...</p></>;

  const risk = riskOf(data.probability);
  return <><Breadcrumbs current={data.customer_name || `Customer #${data.id}`} />
    <CustomerBoard title={data.customer_name || `Customer #${data.id}`} subtitle={`Tenure ${data.tenure} months · ${data.contract} · ${data.internet_service}`} backTo="/predict" backLabel="← All customers" probability={data.probability} risk={risk} tenure={data.tenure} contract={data.contract} offers={offers} offeredIdx={offeredIdx} savedPct={savedPct} offerLoading={offerLoading} offerError={offerError} onGenerate={genOffers} onOffered={markOffered} />
  </>;
}
