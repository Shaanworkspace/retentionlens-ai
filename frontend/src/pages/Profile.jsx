import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const email = user?.email || "Account owner";
  const initials = email.charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Account</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <p className="mt-2 text-slate-600">Manage your ChurnSense workspace and account access.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6 sm:p-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white">{initials}</div>
            <div><h2 className="text-lg font-semibold text-slate-900">Workspace member</h2><p className="mt-1 text-sm text-slate-500">{email}</p></div>
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-1 text-sm font-medium text-slate-800">Account owner</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session</dt><dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active</dd></div>
          </dl>
        </section>
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-8">
          <p className="text-sm font-semibold text-indigo-900">Keep your work moving</p>
          <p className="mt-2 text-sm leading-6 text-indigo-800/80">Your session stays active between visits. Use the account menu whenever you are ready to sign out.</p>
          <div className="mt-6 flex flex-col gap-3"><Link to="/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700">Back to dashboard</Link><button onClick={logout} className="rounded-lg border border-indigo-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-white">Log out</button></div>
        </section>
      </div>
    </main>
  );
}
