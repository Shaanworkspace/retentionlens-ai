import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Offers from "./pages/Offers";
import BatchAnalysis from "./pages/BatchAnalysis";
import CustomerDetail from "./pages/CustomerDetail";
import BatchHistory from "./pages/BatchHistory";
import BatchResult from "./pages/BatchResult";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import Customers from "./pages/Customers";
import Predictions from "./pages/Predictions";
import Analytics from "./pages/Analytics";
import HealthScores from "./pages/HealthScores";
import Data from "./pages/Data";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { UIProvider, useUI } from "./context/UIContext";

function PrivateLayout({ children }) {
  const { sidebarOpen } = useUI();
  return <div className="min-h-screen"><Sidebar /><main className={`glass-main min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-64" : "ml-0"}`}><div className="mx-auto max-w-7xl p-6">{children}</div></main></div>;
}

function PrivatePage({ children }) { return <PrivateRoute><PrivateLayout>{children}</PrivateLayout></PrivateRoute>; }
export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
          <Route path="/predict" element={<PrivatePage><Predict /></PrivatePage>} />
          <Route path="/predictions" element={<PrivatePage><Predictions /></PrivatePage>} />
          <Route path="/offers" element={<PrivatePage><Offers /></PrivatePage>} />
          <Route path="/batch" element={<PrivatePage><BatchAnalysis /></PrivatePage>} />
          <Route path="/batches" element={<PrivatePage><BatchHistory /></PrivatePage>} />
          <Route path="/batch/:id" element={<PrivatePage><BatchResult /></PrivatePage>} />
          <Route path="/customer/:id" element={<PrivatePage><CustomerDetail /></PrivatePage>} />
          <Route path="/profile" element={<PrivatePage><Profile /></PrivatePage>} />
          <Route path="/customers" element={<PrivatePage><Customers /></PrivatePage>} />
          <Route path="/analytics" element={<PrivatePage><Analytics /></PrivatePage>} />
          <Route path="/health" element={<PrivatePage><HealthScores /></PrivatePage>} />
          <Route path="/data" element={<PrivatePage><Data /></PrivatePage>} />
          <Route path="/settings" element={<PrivatePage><Settings /></PrivatePage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
