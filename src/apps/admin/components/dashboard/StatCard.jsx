import React from "react";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { cn } from "@shared/lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  color = "red",
  isLoading = false,
}) => {
  const isPositive = trend === "up";

  const iconBgMap = {
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium",
                isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trendValue}%
            </span>
          )}
          <div className={cn("p-2 rounded-lg", iconBgMap[color] || iconBgMap.slate)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <Loader2 aria-label="Loading" className="h-6 w-6 animate-spin text-red-600" />
        ) : (
          <span className="text-2xl font-semibold tabular-nums text-slate-900 tracking-tight">
            {value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-slate-500 truncate">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
