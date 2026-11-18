import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Pizza,
  Clock,
  ArrowRight,
  Loader2,
  Euro,
  Banknote,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { analyticsService } from "@shared/services";
import StatCard from "../components/dashboard/StatCard";
import {
  RevenueTrendChart,
  CategoryPieChart,
  PeakHoursChart,
} from "../components/dashboard/DashboardCharts";
import { Card, CardHeader, CardTitle, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { useAdminData } from "../context/AdminDataContext";

const formatDateInput = (date) => date.toISOString().split("T")[0];

const DATE_PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "month", label: "This month" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom" },
];

const Dashboard = () => {
  const { orders, ordersLoading: isLoading, fetchOrders } = useAdminData();
  const [refreshing, setRefreshing] = useState(false);
  const [datePreset, setDatePreset] = useState("month");
  const [customRange, setCustomRange] = useState(() => {
    const today = formatDateInput(new Date());
    return { start: today, end: today };
  });

  const { rangeStart, rangeEnd, presetLabel } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (datePreset === "today") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start, rangeEnd: end, presetLabel: "today" };
    }

    if (datePreset === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start, rangeEnd: end, presetLabel: "yesterday" };
    }

    if (datePreset === "7d") {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start, rangeEnd: end, presetLabel: "last 7 days" };
    }

    if (datePreset === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start, rangeEnd: end, presetLabel: "this month" };
    }

    if (datePreset === "30d") {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { rangeStart: start, rangeEnd: end, presetLabel: "last 30 days" };
    }

    const cStart = new Date(customRange.start || formatDateInput(now));
    cStart.setHours(0, 0, 0, 0);
    const cEnd = new Date(customRange.end || formatDateInput(now));
    cEnd.setHours(23, 59, 59, 999);
    return { rangeStart: cStart, rangeEnd: cEnd, presetLabel: "selected range" };
  }, [datePreset, customRange]);

  const trendStart = useMemo(() => {
    if (datePreset === "today" || datePreset === "yesterday") {
      const s = new Date(rangeEnd);
      s.setDate(s.getDate() - 6);
      s.setHours(0, 0, 0, 0);
      return s;
    }
    return rangeStart;
  }, [datePreset, rangeStart, rangeEnd]);

  const queryStartStr = useMemo(() => formatDateInput(trendStart), [trendStart]);
  const queryEndStr = useMemo(() => formatDateInput(rangeEnd), [rangeEnd]);

  useEffect(() => {
    fetchOrders({ startDate: queryStartStr, endDate: queryEndStr });
  }, [fetchOrders, queryStartStr, queryEndStr]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders({ startDate: queryStartStr, endDate: queryEndStr, force: true });
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= rangeStart && d <= rangeEnd;
    });
  }, [orders, rangeStart, rangeEnd]);

  const stats = useMemo(
    () => analyticsService.calculateKPIs(filteredOrders),
    [filteredOrders]
  );

  const revenueTrend = useMemo(
    () => analyticsService.getRevenueTrend(orders, trendStart, rangeEnd),
    [orders, trendStart, rangeEnd]
  );

  const categoryData = useMemo(
    () => analyticsService.getCategoryDistribution(filteredOrders),
    [filteredOrders]
  );

  const peakHours = useMemo(
    () => analyticsService.getPeakHours(filteredOrders),
    [filteredOrders]
  );

  const metrics = useMemo(() => {
    const deliveredOrders = filteredOrders.filter(
      (o) => o.orderStatus === "Delivered"
    );
    const pendingCount = filteredOrders.filter(
      (o) => o.orderStatus === "Pending"
    ).length;
    const preparingCount = filteredOrders.filter(
      (o) => o.orderStatus === "Preparing"
    ).length;
    const outForDeliveryCount = filteredOrders.filter(
      (o) => o.orderStatus === "Out for Delivery"
    ).length;

    const cashRevenue = deliveredOrders
      .filter((o) => o.paymentMethod === "cash")
      .reduce(
        (sum, o) =>
          sum + parseFloat(o.totalPrice || o.totalAmount || o.total || 0),
        0
      );
    const digitalRevenue = deliveredOrders
      .filter((o) => o.paymentMethod !== "cash")
      .reduce(
        (sum, o) =>
          sum + parseFloat(o.totalPrice || o.totalAmount || o.total || 0),
        0
      );

    return {
      deliveredCount: deliveredOrders.length,
      pendingCount,
      preparingCount,
      outForDeliveryCount,
      cashRevenue,
      digitalRevenue,
    };
  }, [filteredOrders]);

  const topSellingItems = useMemo(() => {
    const counts = {};
    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const name = item.name || item.menuItem?.name || "Pizza";
          counts[name] = (counts[name] || 0) + (item.quantity || 1);
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="!font-sans text-xl sm:text-2xl font-semibold !text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time sales overview and kitchen order status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-9 px-3 rounded-lg border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link to="/admin/orders">
              <Button
                size="sm"
                className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
              >
                Orders
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-lg border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
              >
                Reports
              </Button>
            </Link>
          </div>
        </header>

        {/* Date Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${datePreset === preset.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">From</span>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="bg-white border border-slate-200 rounded-lg px-2.5 h-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">To</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="bg-white border border-slate-200 rounded-lg px-2.5 h-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
                />
              </div>
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenue"
            value={`€${stats.totalRevenue.toFixed(2)}`}
            icon={Euro}
            color="emerald"
            description={`${metrics.deliveredCount} delivered (${presetLabel})`}
            isLoading={isLoading}
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon={ShoppingBag}
            color="red"
            description={`${orders.length} total historical orders`}
            isLoading={isLoading}
          />
          <StatCard
            title="Active in Kitchen"
            value={stats.activeOrders}
            icon={Clock}
            color="amber"
            description={`${metrics.pendingCount} pending, ${metrics.preparingCount} preparing, ${metrics.outForDeliveryCount} out`}
            isLoading={isLoading}
          />
          <StatCard
            title="Average Order"
            value={`€${stats.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            color="blue"
            description={`Per delivered order (${presetLabel})`}
            isLoading={isLoading}
          />
        </div>

        {/* Cash vs Digital Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Cash Total</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  €{metrics.cashRevenue.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Cash register
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Online Payment
                </p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  €{metrics.digitalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
              Online Payment
            </span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 px-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                  Sales Trend
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {datePreset === "today" || datePreset === "yesterday"
                    ? "Last 7 days revenue"
                    : `Revenue (${presetLabel})`}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <div
                  aria-label="Loading sales chart"
                  className="flex h-72 items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <RevenueTrendChart data={revenueTrend} />
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 px-5">
              <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                Top Categories
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Menu distribution</p>
            </CardHeader>
            <CardContent className="p-5 flex items-center justify-center">
              {isLoading ? (
                <div
                  aria-label="Loading category chart"
                  className="flex h-64 w-full items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : categoryData.length > 0 ? (
                <CategoryPieChart data={categoryData} />
              ) : (
                <div className="text-center py-16">
                  <Pizza className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">
                    No category data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Peak Hours & Top Selling Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 px-5">
              <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                Peak Hours
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Order volume by hour</p>
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <div
                  aria-label="Loading peak hours chart"
                  className="flex h-80 items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              ) : (
                <PeakHoursChart data={peakHours.slice(11, 24)} />
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4 px-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                  Top Selling Items
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Most ordered products
                </p>
              </div>
              <Link to="/admin/list-items">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Full Menu <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div
                    aria-label="Loading top sellers"
                    className="flex h-60 items-center justify-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : topSellingItems.length > 0 ? (
                  topSellingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-900 text-sm">
                          {item.name}
                        </span>
                      </div>
                      <span className="bg-red-50 text-red-700 px-2.5 py-0.5 rounded-md text-xs font-medium tabular-nums">
                        {item.count} ordered
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No items recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
