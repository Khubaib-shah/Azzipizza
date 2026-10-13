import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Pizza,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { orderService, analyticsService } from "@shared/services";
import StatCard from "../components/dashboard/StatCard";
import { RevenueTrendChart, CategoryPieChart, PeakHoursChart } from "../components/dashboard/DashboardCharts";
import { Card, CardHeader, CardTitle, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const response = await orderService.getAllOrders();
        setOrders(response.data || []);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    dataFetch();
  }, []);

  const stats = useMemo(() => analyticsService.calculateKPIs(orders), [orders]);
  const revenueTrend = useMemo(() => analyticsService.getRevenueTrend(orders), [orders]);
  const categoryData = useMemo(() => analyticsService.getCategoryDistribution(orders), [orders]);
  const peakHours = useMemo(() => analyticsService.getPeakHours(orders), [orders]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black !text-slate-900 tracking-tight">
              Admin <span className="text-red-600 underline underline-offset-8 decoration-slate-200">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">View your latest sales and performance.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/reports">
              <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider px-6">
                View Detailed Reports
              </Button>
            </Link>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue={8.2}
            color="emerald"
            description="Last 30 days"
            isLoading={isLoading}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingBag}
            trend="up"
            trendValue={12.5}
            color="red"
            description="Lifetime orders"
            isLoading={isLoading}
          />
          <StatCard
            title="Average Value"
            value={`$${stats.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            trend="down"
            trendValue={2.1}
            color="amber"
            description="/ per order"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={Clock}
            color="blue"
            description="Orders being prepared"
            isLoading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 border-none shadow-premium rounded-4xl bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 py-6 px-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif font-black text-slate-800">Sales Trend</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Last 7 Days Trend</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            </CardHeader>
            <CardContent className="p-8">
              {isLoading ? (
                <div aria-label="Loading sales chart" className="flex h-72 items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                </div>
              ) : (
                <RevenueTrendChart data={revenueTrend} />
              )}
            </CardContent>
          </Card>

          {/* Pizza Categories */}
          <Card className="border-none shadow-premium rounded-4xl bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 py-6 px-8">
              <CardTitle className="text-xl font-serif font-black text-slate-800">Popular Categories</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Item distribution</p>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-center">
              {isLoading ? (
                <div aria-label="Loading category chart" className="flex h-64 w-full items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                </div>
              ) : categoryData.length > 0 ? (
                <CategoryPieChart data={categoryData} />
              ) : (
                <div className="text-center py-20">
                  <Pizza className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Category Data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours bar chart */}
          <Card className="border-none shadow-premium rounded-4xl bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 py-6 px-8">
              <CardTitle className="text-xl font-serif font-black text-slate-800">Peak Ordering Hours</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Peak Hours</p>
            </CardHeader>
            <CardContent className="p-8">
              {isLoading ? (
                <div aria-label="Loading peak hours chart" className="flex h-96 items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                </div>
              ) : (
                <PeakHoursChart data={peakHours.slice(11, 24)} />
              )}
            </CardContent>
          </Card>

          {/* Recent High Value Orders */}
          <Card className=" border-none shadow-premium rounded-4xl bg-white overflow-hidden">
            <CardHeader className="!pl-6 !pr-2 bg-white border-b border-slate-50 py-6 px-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-serif font-black text-slate-800">Recent High Value</CardTitle>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Top single transactions</p>
              </div>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm" className=" font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 text-red-600">
                  All Orders <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {isLoading ? (
                  <div aria-label="Loading orders" className="flex h-60 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-red-600" />
                  </div>
                ) : orders
                  .sort((a, b) => (b.totalPrice || b.totalAmount || b.total || 0) - (a.totalPrice || a.totalAmount || a.total || 0))
                  .slice(0, 5)
                  .map((order, idx) => (
                    <div key={idx} className="!px-4 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                          <Pizza className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 border-none">{order.name || "Guest User"}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID: {order._id.slice(-6)}</p>
                        </div>
                      </div>
                      <p className="text-lg font-serif font-black text-slate-900 tracking-tight leading-none mb-1">
                        ${parseFloat(order.totalPrice || order.totalAmount || order.total || 0).toFixed(2)}
                      </p>
                    </div>
                  ))
                }
                {orders.length === 0 && (
                  <div className="p-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                    No data yet.
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
