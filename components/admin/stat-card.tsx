import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: "default" | "positive" | "muted";
}

export function StatCard({ icon, label, value, tone = "default" }: StatCardProps) {
  const toneCls =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-primary";

  return (
    <div className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg bg-surface border border-white/10 flex items-center justify-center shrink-0 ${toneCls}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}
