import { useState } from "react";
import { Link } from "react-router-dom";

const benefits = [
  { number: "01", title: "See risk sooner", text: "Turn account details into a clear churn signal before a renewal conversation becomes urgent.", color: "bg-indigo-600" },
  { number: "02", title: "Focus every conversation", text: "Give your team a simple view of which customers need attention and why.", color: "bg-teal-500" },
  { number: "03", title: "Make retention practical", text: "Move from a probability score to a thoughtful, customer-ready next step.", color: "bg-orange-400" },
];

const workflows = [
  { label: "01 / Understand", title: "Start with the whole customer story", text: "Bring tenure, plan, charges, and service signals together in one focused assessment.", tone: "from-indigo-600 to-blue-500" },
  { label: "02 / Prioritize", title: "Know where to spend your time", text: "Use model confidence and account context to separate healthy customers from accounts that need a closer look.", tone: "from-teal-500 to-emerald-500" },
  { label: "03 / Act", title: "Give your next conversation a purpose", text: "Generate relevant retention ideas that help your team move from insight to action.", tone: "from-orange-400 to-rose-400" },
];

export default function Landing() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);

  return (
    <main className="overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="pointer-events-none absolute -left-40 top-8 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Customer retention intelligence</p>
            <h1 className="text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-7xl">Make every customer moment count.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">ChurnSense helps teams spot risk, understand what is changing, and take the next best retention action with confidence.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="primary-button text-center">Start for free <span className="ml-1">→</span></Link>
              <Link to="/predict" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700">Explore a prediction</Link>
            </div>
            <p className="mt-5 text-xs text-slate-500">Built for teams that want fewer surprises and better customer conversations.</p>
          </div>
          <div className="relative">
            <div className="absolute -right-12 -top-10 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-3 shadow-2xl shadow-indigo-900/20 sm:p-5">
              <div className="image-stage rounded-[1.4rem] p-5 sm:p-7">
                <div className="mb-14 flex items-center justify-between text-white"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Account intelligence</p><p className="mt-2 text-lg font-semibold">Your retention view</p></div><span className="rounded-full bg-white/15 px-3 py-1 text-xs">Live</span></div>
                <div className="rounded-2xl border border-white/30 bg-white/95 p-5 shadow-xl backdrop-blur-md sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority account</p><p className="mt-2 text-2xl font-bold text-slate-950">Northstar Labs</p><p className="mt-1 text-sm text-slate-500">Month-to-month · Fiber optic</p></div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">Watch</span></div><div className="mt-7 grid grid-cols-3 gap-3"><div className="rounded-xl bg-indigo-50 p-3"><p className="text-xs text-indigo-600">Risk</p><p className="mt-1 text-lg font-bold text-indigo-950">68%</p></div><div className="rounded-xl bg-teal-50 p-3"><p className="text-xs text-teal-600">Tenure</p><p className="mt-1 text-lg font-bold text-teal-950">8 mo</p></div><div className="rounded-xl bg-orange-50 p-3"><p className="text-xs text-orange-600">Action</p><p className="mt-1 text-lg font-bold text-orange-950">2</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-indigo-500 to-orange-400" /></div><p className="mt-2 text-xs text-slate-500">Confidence-backed customer signal</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">Why ChurnSense</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">A clearer way to protect customer relationships.</h2></div><div className="mt-14 grid gap-4 md:grid-cols-3">{benefits.map((benefit) => <article key={benefit.number} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${benefit.color} text-sm font-bold text-white`}>{benefit.number}</span><h3 className="mt-12 text-xl font-semibold">{benefit.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{benefit.text}</p></article>)}</div></div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">How it works</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">From customer signal to confident action.</h2><p className="mt-5 leading-7 text-slate-600">A focused workflow for teams that need useful answers, not another complicated analytics screen.</p><div className="mt-9 space-y-2">{workflows.map((workflow, index) => <button key={workflow.label} onClick={() => setActiveWorkflow(index)} className={`w-full rounded-xl border p-4 text-left transition ${activeWorkflow === index ? "border-indigo-200 bg-indigo-50 shadow-sm" : "border-transparent hover:bg-slate-50"}`}><p className={`text-xs font-bold uppercase tracking-wider ${activeWorkflow === index ? "text-indigo-600" : "text-slate-400"}`}>{workflow.label}</p><p className="mt-2 font-semibold text-slate-900">{workflow.title}</p></button>)}</div></div><div className={`min-h-[25rem] rounded-[2rem] bg-gradient-to-br ${workflows[activeWorkflow].tone} p-6 text-white shadow-xl sm:p-10`}><div className="flex h-full min-h-[22rem] flex-col justify-between"><div><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Interactive workflow</span><h3 className="mt-8 max-w-lg text-4xl font-bold tracking-tight sm:text-5xl">{workflows[activeWorkflow].title}</h3><p className="mt-5 max-w-md text-base leading-7 text-white/85">{workflows[activeWorkflow].text}</p></div><div className="rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-sm"><div className="flex items-center justify-between text-sm"><span>Workflow progress</span><span>{activeWorkflow + 1} / {workflows.length}</span></div><div className="mt-4 flex gap-2">{workflows.map((workflow, index) => <span key={workflow.label} className={`h-2 flex-1 rounded-full ${index <= activeWorkflow ? "bg-white" : "bg-white/25"}`} />)}</div></div></div></div></div>
      </section>

      <section id="proof" className="border-y border-slate-200 bg-white px-5 py-20 sm:px-8 sm:py-24"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Built for measurable progress</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Less guesswork. More meaningful follow-through.</h2></div><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-indigo-50 p-5"><p className="text-3xl font-bold text-indigo-950">7,043</p><p className="mt-2 text-sm text-indigo-900/70">records in the evaluation dataset</p></div><div className="rounded-2xl bg-teal-50 p-5"><p className="text-3xl font-bold text-teal-950">0.84</p><p className="mt-2 text-sm text-teal-900/70">ROC-AUC model performance</p></div><div className="rounded-2xl bg-orange-50 p-5"><p className="text-3xl font-bold text-orange-950">1 view</p><p className="mt-2 text-sm text-orange-900/70">from insight to next action</p></div></div></div></section>

      <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 px-6 py-14 text-white shadow-xl sm:px-14"><div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-100">Ready to begin?</p><h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-5xl">Give your customer team a sharper view.</h2></div><Link to="/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50">Create your workspace <span className="ml-1">→</span></Link></div></div></section>
    </main>
  );
}
