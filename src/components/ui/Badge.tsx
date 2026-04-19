import { cn } from "@/lib/utils";

type Variant = "navy" | "amber" | "accent" | "clover" | "slate" | "outline";

const styles: Record<Variant, string> = {
  navy: "bg-navy-pale text-navy border-navy-light",
  amber: "bg-amber-soft text-amber border-amber/30",
  accent: "bg-accent-soft text-accent border-accent/30",
  clover: "bg-clover-soft text-clover border-clover/30",
  slate: "bg-slate-light text-slate border-hairline",
  outline: "bg-white text-navy border-navy-light",
};

export function Badge({
  children,
  variant = "navy",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
