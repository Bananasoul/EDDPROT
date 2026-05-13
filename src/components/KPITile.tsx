import { cn } from "@/lib/utils";

export function KPITile({
  label,
  value,
  sub,
  icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  tone?: "navy" | "amber" | "accent" | "clover" | "cyan";
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-pale text-navy",
    amber: "bg-amber-soft text-amber",
    accent: "bg-accent-soft text-accent",
    clover: "bg-clover-soft text-clover",
    cyan: "bg-cyan-soft text-cyan-mid",
  };
  return (
    <div className="bg-white rounded-xl border border-hairline p-4 flex items-start gap-3">
      {icon && (
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", tones[tone])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate font-medium uppercase tracking-wide truncate">{label}</div>
        <div className="font-serif text-2xl text-navy leading-tight mt-0.5">{value}</div>
        {sub && <div className="text-xs text-slate mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
