import { Link } from "react-router-dom";
export default function NotFound() {
  return <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center"><p className="text-7xl font-bold text-blue-600">404</p><h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1><p className="mt-2 text-slate-500">The page you requested does not exist.</p><Link to="/dashboard" className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Go to Dashboard</Link></main>;
}
