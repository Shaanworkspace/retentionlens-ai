export default function HealthDot({ score }) {
  const color = score < 50 ? "bg-red-500" : score < 70 ? "bg-yellow-500" : "bg-green-500";
  return <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{score}</span>;
}
