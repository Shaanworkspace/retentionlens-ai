export default function Skeleton({ className = "h-24" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} aria-hidden="true" />;
}
