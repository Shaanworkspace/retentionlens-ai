import { Link } from "react-router-dom";
export default function Landing() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-slate-900">Predict Customer Churn Before It Happens</h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl">End-to-end ML pipeline: data collection, cleaning, EDA, feature engineering, training, evaluation and deployment with FastAPI and React.</p>
      <div className="mt-8 flex gap-4">
        <Link to="/predict" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Try Prediction</Link>
        <Link to="/dashboard" className="border px-6 py-3 rounded-lg">View Dashboard</Link>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-6 max-w-3xl">
        <div className="p-4 bg-white border rounded">F1 0.80<br /><span className="text-sm text-slate-500">XGBoost</span></div>
        <div className="p-4 bg-white border rounded">ROC-AUC 0.84<br /><span className="text-sm text-slate-500">Evaluation</span></div>
        <div className="p-4 bg-white border rounded">7043 Rows<br /><span className="text-sm text-slate-500">IBM Telco</span></div>
      </div>
    </div>
  );
}
