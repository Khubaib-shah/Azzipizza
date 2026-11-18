import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Download,
  Pizza,
  TrendingUp,
  Loader2,
  Euro,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
} from "lucide-react";
import { analyticsService } from "@shared/services";
import { Card, CardHeader, CardTitle, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { RevenueTrendChart } from "../components/dashboard/DashboardCharts";
import StatCard from "../components/dashboard/StatCard";
import PageHeader from "@shared/components/ui/PageHeader";
import { useAdminData } from "../context/AdminDataContext";

const Reports = () => {
  const { orders, ordersLoading: isLoading, fetchOrders } = useAdminData();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfMonth.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    };
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchOrders({ startDate: dateRange.start, endDate: dateRange.end });
  }, [fetchOrders, dateRange.start, dateRange.end]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders({
        startDate: dateRange.start,
        endDate: dateRange.end,
        force: true,
      });
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const applyPreset = (days) => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setDateRange({ start, end });
    setPageIndex(0);
  };

  const filteredOrdersByTime = useMemo(() => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }, [orders, dateRange]);

  const periodStats = useMemo(
    () => analyticsService.calculateKPIs(filteredOrdersByTime),
    [filteredOrdersByTime]
  );

  const deliveredCount = useMemo(
    () => filteredOrdersByTime.filter((o) => o.orderStatus === "Delivered").length,
    [filteredOrdersByTime]
  );

  const reportData = useMemo(
    () => analyticsService.getRevenueTrend(orders, dateRange.start, dateRange.end),
    [orders, dateRange]
  );

  const pageCount = Math.max(1, Math.ceil(filteredOrdersByTime.length / pageSize));

  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(0);
    }
  }, [pageIndex, pageCount]);

  const paginatedOrders = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredOrdersByTime.slice(start, start + pageSize);
  }, [filteredOrdersByTime, pageIndex, pageSize]);

  const startRow = filteredOrdersByTime.length === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredOrdersByTime.length);

  const exportToCSV = () => {
    if (!filteredOrdersByTime.length) return;
    const headers = [
      "Order ID",
      "Date",
      "Time",
      "Customer",
      "Phone",
      "Street",
      "City",
      "Doorbell",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Total (EUR)",
    ];
    const rows = filteredOrdersByTime.map((o) => [
      `"${o._id}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${new Date(o.createdAt).toLocaleTimeString()}"`,
      `"${(o.name || "").replace(/"/g, '""')}"`,
      `"${(o.phoneNumber || "").replace(/"/g, '""')}"`,
      `"${(o.deliveryAddress?.street || "").replace(/"/g, '""')}"`,
      `"${(o.deliveryAddress?.city || "").replace(/"/g, '""')}"`,
      `"${(o.doorbellName || "").replace(/"/g, '""')}"`,
      `"${o.paymentMethod || ""}"`,
      `"${o.paymentStatus || ""}"`,
      `"${o.orderStatus || ""}"`,
      parseFloat(o.totalPrice || o.totalAmount || o.total || 0).toFixed(2),
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `azzipizza-report-${dateRange.start}-to-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5 pb-12">
        <PageHeader
          title="Reports"
          subtitle="Sales analytics and order history for your selected date range."
          actions={
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-9 px-3 rounded-lg border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredOrdersByTime.length === 0}
                className="h-9 px-3 rounded-lg border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Date Range Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs print:hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, start: e.target.value }));
                  setPageIndex(0);
                }}
                className="bg-white border border-slate-200 rounded-lg px-3 h-9 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange((prev) => ({ ...prev, end: e.target.value }));
                  setPageIndex(0);
                }}
                className="bg-white border border-slate-200 rounded-lg px-3 h-9 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(7)}
              className="h-8 px-3 rounded-lg border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer"
            >
              Last 7 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(30)}
              className="h-8 px-3 rounded-lg border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer"
            >
              Last 30 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(90)}
              className="h-8 px-3 rounded-lg border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer"
            >
              Last 90 days
            </Button>
          </div>
        </div>

        {/* Period KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Period Revenue"
            value={`€${periodStats.totalRevenue.toFixed(2)}`}
            icon={Euro}
            color="emerald"
            description="Delivered orders in range"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Orders"
            value={periodStats.totalOrders}
            icon={ShoppingBag}
            color="red"
            description="Orders placed in range"
            isLoading={isLoading}
          />
          <StatCard
            title="Delivered"
            value={deliveredCount}
            icon={CheckCircle2}
            color="blue"
            description="Completed deliveries"
            isLoading={isLoading}
          />
          <StatCard
            title="Average Order"
            value={`€${periodStats.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            color="amber"
            description="Per delivered order"
            isLoading={isLoading}
          />
        </div>

        {/* Revenue Trend Chart */}
        <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4 px-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                Sales Trend
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily revenue for the selected range
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
          </CardHeader>
          <CardContent className="p-5">
            {isLoading ? (
              <div aria-label="Loading sales chart" className="flex h-72 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              </div>
            ) : (
              <RevenueTrendChart data={reportData} />
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 py-4 px-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="!font-sans text-sm font-semibold text-slate-900">
                Order History
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredOrdersByTime.length} matching orders
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-10 text-xs font-medium text-slate-500 pl-4 w-32">
                      Order ID
                    </TableHead>
                    <TableHead className="h-10 text-xs font-medium text-slate-500">
                      Customer
                    </TableHead>
                    <TableHead className="h-10 text-xs font-medium text-slate-500 hidden sm:table-cell">
                      Date & Time
                    </TableHead>
                    <TableHead className="h-10 text-xs font-medium text-slate-500 hidden md:table-cell">
                      Items
                    </TableHead>
                    <TableHead className="h-10 text-xs font-medium text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="h-10 text-xs font-medium text-slate-500 text-right pr-4">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow aria-label="Loading report data">
                      <TableCell colSpan={6} className="h-64 text-center">
                        <Loader2 className="h-7 w-7 animate-spin text-red-600 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, idx) => (
                      <TableRow
                        key={order._id || idx}
                        className="hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="pl-4 py-3">
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 text-xs font-medium text-slate-900">
                          {order.name || "Customer"}
                        </TableCell>

                        <TableCell className="py-3 hidden sm:table-cell">
                          <div className="text-xs font-medium text-slate-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Pizza className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.items?.length || 0} items</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              order.orderStatus === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : order.orderStatus === "Cancelled"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 pr-4 text-right font-semibold tabular-nums text-slate-900 text-sm">
                          €{parseFloat(order.totalPrice || order.totalAmount || order.total || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-900 mb-1">
                          No orders found
                        </p>
                        <p className="text-slate-500 text-xs">
                          Try selecting a different date range.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Bar */}
            {filteredOrdersByTime.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 bg-slate-50/40 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rows per page</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPageIndex(0);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16 bg-white border-slate-200 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {[10, 25, 50].map((size) => (
                        <SelectItem key={size} value={String(size)} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 tabular-nums">
                    <span className="font-medium text-slate-900">
                      {startRow}-{endRow}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-slate-900">
                      {filteredOrdersByTime.length}
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-slate-200 bg-white cursor-pointer"
                      onClick={() => setPageIndex(0)}
                      disabled={pageIndex === 0}
                      aria-label="First page"
                    >
                      <ChevronFirst className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-slate-200 bg-white cursor-pointer"
                      onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                      disabled={pageIndex === 0}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-slate-200 bg-white cursor-pointer"
                      onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={pageIndex >= pageCount - 1}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-slate-200 bg-white cursor-pointer"
                      onClick={() => setPageIndex(pageCount - 1)}
                      disabled={pageIndex >= pageCount - 1}
                      aria-label="Last page"
                    >
                      <ChevronLast className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
