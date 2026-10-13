import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, description, color = "red", isLoading = false }) => {
  const isPositive = trend === 'up';
  
  const colorMap = {
    red: "from-red-500/10 to-transparent text-red-600",
    amber: "from-amber-500/10 to-transparent text-amber-600",
    emerald: "from-emerald-500/10 to-transparent text-emerald-600",
    blue: "from-blue-500/10 to-transparent text-blue-600",
    slate: "from-slate-500/10 to-transparent text-slate-600",
  };

  const borderMap = {
    red: "hover:border-red-200",
    amber: "hover:border-amber-200",
    emerald: "hover:border-emerald-200",
    blue: "hover:border-blue-200",
    slate: "hover:border-slate-200",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "relative p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300",
        borderMap[color] || "hover:border-red-200"
      )}
    >
      {/* Background Glow */}
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 bg-linear-to-br blur-3xl opacity-50", colorMap[color])} />

      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl bg-slate-50", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}%
          </div>
        )}
      </div>

      <div>
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <Loader2 aria-label="Loading" className="h-7 w-7 animate-spin text-red-600" />
          ) : (
            <span className="text-3xl font-serif font-black text-slate-900 tracking-tight">{value}</span>
          )}
        </div>
        {description && <p className="mt-2 text-xs text-slate-400 font-medium">{description}</p>}
      </div>
    </motion.div>
  );
};

export default StatCard;
