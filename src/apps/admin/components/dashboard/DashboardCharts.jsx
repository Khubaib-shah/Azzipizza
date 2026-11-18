import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && payload[0] && payload[0].value !== undefined) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-xl font-serif font-black text-red-600">
          €{parseFloat(payload[0].value || 0).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueTrendChart = ({ data }) => {
  return (
    <div className="h-72 w-full mt-6 -ml-4 sm:ml-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#ef4444"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryPieChart = ({ data }) => {
  const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#6366f1"];
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={74}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={({ percent }) =>
                percent >= 0.06 ? `${(percent * 100).toFixed(0)}%` : ""
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              }}
              itemStyle={{ fontSize: "12px", fontWeight: "600" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-3">
        {data.map((entry, index) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <div
              key={entry.name || index}
              className="flex items-center justify-between text-xs px-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-700 font-medium truncate">
                  {entry.name}
                </span>
              </div>
              <span className="text-slate-500 font-medium tabular-nums shrink-0 ml-2">
                {entry.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PeakHoursChart = ({ data }) => {
  return (
    <div className="h-96 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: 900 }}
          />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
          />
          <Bar dataKey="orders" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
