import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-hairline shadow-[0_1px_3px_rgba(30,58,95,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between px-5 pt-4 pb-3 border-b border-hairline/60",
        className
      )}
    >
      <div>
        <h3 className="font-serif text-base text-navy leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
