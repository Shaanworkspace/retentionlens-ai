export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="text-slate-600 mt-2">Model pipeline overview and metrics</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border p-4 rounded bg-white"><p className="text-sm text-slate-500">Best Model</p><p className="font-bold">XGBoost</p></div>
        <div className="border p-4 rounded bg-white"><p className="text-sm text-slate-500">F1 Score</p><p className="font-bold">0.80</p></div>
        <div className="border p-4 rounded bg-white"><p className="text-sm text-slate-500">ROC-AUC</p><p className="font-bold">0.84</p></div>
      </div>
      <div className="mt-6 border rounded p-4 bg-white">
        <h3 className="font-semibold">Pipeline</h3>
        <ol className="list-decimal ml-6 mt-2 text-sm space-y-1">
          <li>Data Collection - IBM Telco 7043 rows</li>
          <li>Data Cleaning - TotalCharges imputed, duplicates removed</li>
          <li>Preprocessing - StandardScaler + OneHotEncoder</li>
          <li>EDA - Contract vs Churn, Tenure analysis</li>
          <li>Feature Engineering - TenureGroup, HasMultipleServices</li>
          <li>Train/Test Split - 80/20 stratified</li>
          <li>Model - Logistic Regression, Random Forest, XGBoost</li>
          <li>Evaluation - Accuracy, Precision, Recall, F1, ROC-AUC</li>
          <li>Deployment - FastAPI + Docker + Streamlit</li>
        </ol>
      </div>
    </div>
  );
}
