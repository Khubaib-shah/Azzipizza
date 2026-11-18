import { useEffect, useState, useReducer, useMemo } from "react";
import { orderService } from "@shared/services";
import OrderSideBar from "../components/OrderSideBar";
import { Search, RefreshCw, ShoppingBag, Loader2 } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import CompletedOrderTable from "../components/CompletedOrderTable";
import ActiveOrderTable from "../components/ActiveOrderTable";
import { reducer } from "@shared/utils/reducer";
import { toast } from "react-toastify";
import PageHeader from "@shared/components/ui/PageHeader";
import { useAdminSocket } from "../context/AdminSocketContext";
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

const initialState = {
  loading: false,
  delLoading: false,
  upLoading: false,
  punchLoading: false,
};

const Orders = () => {
  const {
    fetchPaginatedOrders,
    invalidateOrdersCache,
    ordersVersion,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageOrders, setPageOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [datePreset, setDatePreset] = useState("today");
  const [customRange, setCustomRange] = useState(() => {
    const today = formatDateInput(new Date());
    return { start: today, end: today };
  });
  const [refreshing, setRefreshing] = useState(false);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (datePreset === "today") {
      return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
    }
    if (datePreset === "yesterday") {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
    }
    if (datePreset === "7d") {
      start.setDate(start.getDate() - 6);
      return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
    }
    if (datePreset === "month") {
      start.setDate(1);
      return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
    }
    if (datePreset === "30d") {
      start.setDate(start.getDate() - 29);
      return { startDate: formatDateInput(start), endDate: formatDateInput(end) };
    }
    return {
      startDate: customRange.start || "",
      endDate: customRange.end || "",
    };
  }, [datePreset, customRange]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { emit, playAlert, isAudioBlocked } = useAdminSocket();

  // Debounce search input to avoid firing API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    const loadPage = async () => {
      if (pageOrders.length === 0) {
        setLoading(true);
      }
      try {
        const res = await fetchPaginatedOrders({
          page,
          limit: pageSize,
          tab: activeTab,
          status: statusFilter,
          search: debouncedSearch,
          startDate,
          endDate,
        });
        if (!cancelled && res) {
          setPageOrders(res.orders || []);
          setTotalOrders(res.total || 0);
          setActiveCount(res.activeCount ?? 0);
          setCompletedCount(res.completedCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    loadPage();
    return () => {
      cancelled = true;
    };
  }, [
    fetchPaginatedOrders,
    page,
    pageSize,
    activeTab,
    statusFilter,
    debouncedSearch,
    startDate,
    endDate,
    ordersVersion,
  ]);

  // Keep selectedOrder synced if the current page updates
  useEffect(() => {
    if (!selectedOrder?._id) return;
    const latest = pageOrders.find((o) => o._id === selectedOrder._id);
    if (latest && latest !== selectedOrder) {
      setSelectedOrder(latest);
    }
  }, [pageOrders, selectedOrder]);

  const refreshOrders = async () => {
    setRefreshing(true);
    try {
      const res = await fetchPaginatedOrders({
        page,
        limit: pageSize,
        tab: activeTab,
        status: statusFilter,
        search: debouncedSearch,
        startDate,
        endDate,
        force: true,
      });
      if (res) {
        setPageOrders(res.orders || []);
        setTotalOrders(res.total || 0);
        setActiveCount(res.activeCount ?? 0);
        setCompletedCount(res.completedCount ?? 0);
      }
      toast.info("Order list updated.", { autoClose: 1000 });
    } catch {
      toast.error("Could not refresh orders.");
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    if (order.eta) {
      setEtaMinutes(Math.max(0, Math.floor((new Date(order.eta) - Date.now()) / 60000)));
    } else {
      setEtaMinutes(20);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    dispatch({ type: "SET_UP_LOADING", payload: true });
    try {
      const etaTime = new Date(Date.now() + etaMinutes * 60000);
      await orderService.updateOrder(selectedOrder._id, { eta: etaTime });

      setPageOrders((prev) =>
        prev.map((o) => (o._id === selectedOrder._id ? { ...o, eta: etaTime } : o))
      );
      setSelectedOrder((prev) => (prev ? { ...prev, eta: etaTime } : prev));
      invalidateOrdersCache();

      toast.success("Order ETA updated.");
    } catch {
      toast.error("Failed to update ETA.");
    } finally {
      dispatch({ type: "SET_UP_LOADING", payload: false });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    dispatch({ type: "SET_UP_LOADING", payload: true });
    try {
      await orderService.updateOrder(orderId, { orderStatus: newStatus });
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : prev));
      }
      invalidateOrdersCache();

      toast.success(`Order status: ${newStatus}`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      dispatch({ type: "SET_UP_LOADING", payload: false });
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    dispatch({ type: "SET_UP_LOADING", payload: true });
    try {
      await orderService.updateOrder(orderId, { paymentStatus: newPaymentStatus });
      setPageOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, paymentStatus: newPaymentStatus } : prev
        );
      }
      invalidateOrdersCache();

      toast.success(`Payment status: ${newPaymentStatus}`);
    } catch {
      toast.error("Failed to update payment status.");
    } finally {
      dispatch({ type: "SET_UP_LOADING", payload: false });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    dispatch({ type: "SET_DEL_LOADING", payload: true });
    try {
      await orderService.deleteOrder(orderId);
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
      emit("order:delete", orderId);
      invalidateOrdersCache();
      toast.success("Order removed.");
    } catch {
      toast.error("Failed to delete order.");
    } finally {
      dispatch({ type: "SET_DEL_LOADING", payload: false });
    }
  };

  const statusOptions = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6">
      {isAudioBlocked && (
        <div
          onClick={playAlert}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 animate-pulse" />
          <div>
            <p className="font-semibold text-xs">Sound Blocked</p>
            <p className="text-[11px] opacity-90">Click to enable order alerts</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Orders"
          subtitle="Track active kitchen orders and review order history."
          actions={
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-0 md:min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search customer, phone, street..."
                  className="pl-9 w-full bg-white border border-slate-200 rounded-lg h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-28 sm:w-40 shrink-0 bg-white border border-slate-200 rounded-lg text-slate-700 h-9 px-2.5 sm:px-3 text-xs font-medium">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200 shadow-lg p-1 bg-white z-[60]">
                  <SelectItem value="All Statuses" className="font-medium cursor-pointer h-8 px-2.5 text-xs">
                    All Statuses
                  </SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s} className="cursor-pointer h-8 px-2.5 text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={refreshOrders}
                className="rounded-lg border-slate-200 bg-white h-9 w-9 hover:bg-slate-50 cursor-pointer shrink-0"
                title="Refresh orders"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          }
        />

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
          className="w-full"
        >
          {/* Tabs + Date Filters side-by-side */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-4">
            <TabsList className="inline-flex h-10 w-fit items-center rounded-lg bg-slate-200/70 p-1 shrink-0">
              <TabsTrigger
                value="active"
                className="px-4 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
              >
                Active Orders ({activeCount})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="px-4 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
              >
                Completed ({completedCount})
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center gap-1">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setDatePreset(preset.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      datePreset === preset.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {datePreset === "custom" && (
                <div className="flex flex-wrap items-center gap-2 pl-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">From</span>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => {
                        setCustomRange((prev) => ({ ...prev, start: e.target.value }));
                        setPage(1);
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 h-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">To</span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => {
                        setCustomRange((prev) => ({ ...prev, end: e.target.value }));
                        setPage(1);
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 h-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-600/15"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="active" className="focus-visible:outline-none mt-0">
            <Card className="border border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-72 gap-3">
                    <Loader2 className="h-7 w-7 text-red-600 animate-spin" />
                    <p className="text-xs font-medium text-slate-400">Loading orders...</p>
                  </div>
                ) : pageOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-72 p-8 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">No Active Orders</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-xs">
                      New orders will appear here as soon as they are placed.
                    </p>
                  </div>
                ) : (
                  <ActiveOrderTable
                    filteredOrders={pageOrders}
                    handleSelectOrder={handleSelectOrder}
                    onStatusChange={handleStatusChange}
                    page={page}
                    pageSize={pageSize}
                    total={totalOrders}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="focus-visible:outline-none mt-0">
            <Card className="border border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-72">
                    <Loader2 className="h-7 w-7 text-red-600 animate-spin" />
                  </div>
                ) : pageOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-72 p-8 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">No Completed Orders</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-xs">
                      Delivered or cancelled orders will appear here.
                    </p>
                  </div>
                ) : (
                  <CompletedOrderTable
                    filteredOrders={pageOrders}
                    handleSelectOrder={handleSelectOrder}
                    page={page}
                    pageSize={pageSize}
                    total={totalOrders}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <OrderSideBar
        selectedOrder={selectedOrder}
        etaMinutes={etaMinutes}
        setEtaMinutes={setEtaMinutes}
        setSelectedOrder={setSelectedOrder}
        handleUpdateOrder={handleUpdateOrder}
        handleStatusChange={handleStatusChange}
        handlePaymentStatusChange={handlePaymentStatusChange}
        handleDeleteOrder={handleDeleteOrder}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
};

export default Orders;
