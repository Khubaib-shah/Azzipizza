import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { orderService, menuService } from "@shared/services";
import { useAdminSocket } from "./AdminSocketContext";

const AdminDataContext = createContext(null);

const CACHE_TTL_MS = 60 * 1000;

export const AdminDataProvider = ({ children }) => {
  const { registerListener } = useAdminSocket();

  // Orders cache (for Dashboard & Reports analytics, keyed by date range)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const ordersRangeCacheRef = useRef(new Map());
  const ordersInFlightRef = useRef(new Map());

  // Paginated orders cache (for Orders page)
  const paginatedCacheRef = useRef(new Map());
  const paginatedInFlightRef = useRef(new Map());
  const [ordersVersion, setOrdersVersion] = useState(0);

  // Menu items cache (for ListItems page)
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState("");
  const menuFetchedAtRef = useRef(0);
  const menuInFlightRef = useRef(null);

  const invalidateOrdersCache = useCallback(() => {
    paginatedCacheRef.current.clear();
    ordersRangeCacheRef.current.clear();
    setOrdersVersion((v) => v + 1);
  }, []);

  const fetchOrders = useCallback(async ({ startDate = "", endDate = "", force = false } = {}) => {
    const cacheKey = `${startDate}|${endDate}`;
    const cached = ordersRangeCacheRef.current.get(cacheKey);
    const isFresh =
      !force &&
      cached &&
      Date.now() - cached.fetchedAt < CACHE_TTL_MS;

    if (isFresh) {
      setOrders(cached.data);
      return cached.data;
    }

    if (ordersInFlightRef.current.has(cacheKey)) {
      return ordersInFlightRef.current.get(cacheKey);
    }

    if (!cached) {
      setOrdersLoading(true);
    }
    setOrdersError("");

    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const request = orderService
      .getAllOrders(params)
      .then((response) => {
        const sortedData = [...(response.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        ordersRangeCacheRef.current.set(cacheKey, {
          data: sortedData,
          fetchedAt: Date.now(),
        });
        setOrders(sortedData);
        return sortedData;
      })
      .catch((error) => {
        console.error("[AdminData Orders Fetch Error]:", error);
        setOrdersError("Failed to load orders.");
        throw error;
      })
      .finally(() => {
        ordersInFlightRef.current.delete(cacheKey);
        setOrdersLoading(false);
      });

    ordersInFlightRef.current.set(cacheKey, request);
    return request;
  }, []);

  const fetchPaginatedOrders = useCallback(
    async ({
      page = 1,
      limit = 10,
      tab = "active",
      status = "",
      search = "",
      startDate = "",
      endDate = "",
      force = false,
    }) => {
      const normalizedStatus = status && status !== "All Statuses" ? status : "";
      const normalizedSearch = search.trim();
      const cacheKey = `${tab}|${page}|${limit}|${normalizedStatus}|${normalizedSearch}|${startDate}|${endDate}`;

      if (!force) {
        const cached = paginatedCacheRef.current.get(cacheKey);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          return cached.data;
        }
      }

      if (paginatedInFlightRef.current.has(cacheKey)) {
        return paginatedInFlightRef.current.get(cacheKey);
      }

      const params = { page, limit, tab };
      if (normalizedStatus) params.status = normalizedStatus;
      if (normalizedSearch) params.search = normalizedSearch;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const request = orderService
        .getPaginatedOrders(params)
        .then((response) => {
          const raw = response.data;
          let normalized = raw;

          // Fallback if backend returned legacy array format instead of paginated object
          if (Array.isArray(raw)) {
            const sorted = [...raw].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            const matchesBase = (o) => {
              if (normalizedStatus && o.orderStatus !== normalizedStatus) return false;
              if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                if (new Date(o.createdAt) < s) return false;
              }
              if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                if (new Date(o.createdAt) > e) return false;
              }
              if (normalizedSearch) {
                const q = normalizedSearch.toLowerCase();
                const hit =
                  o._id?.toLowerCase().includes(q) ||
                  o.name?.toLowerCase().includes(q) ||
                  o.phoneNumber?.toLowerCase().includes(q) ||
                  o.deliveryAddress?.street?.toLowerCase().includes(q) ||
                  o.doorbellName?.toLowerCase().includes(q) ||
                  o.items?.some((i) =>
                    (i.name || i.menuItem?.name || "").toLowerCase().includes(q)
                  );
                if (!hit) return false;
              }
              return true;
            };

            const baseFiltered = sorted.filter(matchesBase);
            const activeList = baseFiltered.filter(
              (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled"
            );
            const completedList = baseFiltered.filter(
              (o) => o.orderStatus === "Delivered" || o.orderStatus === "Cancelled"
            );
            const targetList = tab === "completed" ? completedList : activeList;
            const startIdx = (page - 1) * limit;

            normalized = {
              orders: targetList.slice(startIdx, startIdx + limit),
              total: targetList.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(targetList.length / limit)),
              activeCount: activeList.length,
              completedCount: completedList.length,
            };
          }

          paginatedCacheRef.current.set(cacheKey, {
            data: normalized,
            fetchedAt: Date.now(),
          });
          return normalized;
        })
        .finally(() => {
          paginatedInFlightRef.current.delete(cacheKey);
        });

      paginatedInFlightRef.current.set(cacheKey, request);
      return request;
    },
    []
  );

  const fetchMenuItems = useCallback(async (force = false) => {
    const isFresh =
      !force &&
      menuFetchedAtRef.current > 0 &&
      Date.now() - menuFetchedAtRef.current < CACHE_TTL_MS;

    if (isFresh) {
      return;
    }

    if (menuInFlightRef.current) {
      return menuInFlightRef.current;
    }

    const showSpinner = menuFetchedAtRef.current === 0;
    if (showSpinner) {
      setMenuLoading(true);
    }
    setMenuError("");

    const request = menuService
      .getAllItems()
      .then((response) => {
        const data = response.data || [];
        setMenuItems(data);
        menuFetchedAtRef.current = Date.now();
        return data;
      })
      .catch((error) => {
        console.error("[AdminData Menu Fetch Error]:", error);
        setMenuError("Failed to load menu items.");
        throw error;
      })
      .finally(() => {
        menuInFlightRef.current = null;
        setMenuLoading(false);
      });

    menuInFlightRef.current = request;
    return request;
  }, []);

  // Keep cached orders synced with real-time socket events
  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      if (!newOrder?._id) return;
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      paginatedCacheRef.current.clear();
      setOrdersVersion((v) => v + 1);
    };

    const handleOrderUpdate = (updated) => {
      if (!updated?._id) return;
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
      paginatedCacheRef.current.clear();
      setOrdersVersion((v) => v + 1);
    };

    const handleOrderDelete = (id) => {
      if (!id) return;
      setOrders((prev) => prev.filter((o) => o._id !== id));
      paginatedCacheRef.current.clear();
      setOrdersVersion((v) => v + 1);
    };

    const unbindNew = registerListener("order:new", handleNewOrder);
    const unbindUpdate = registerListener("order:update", handleOrderUpdate);
    const unbindDelete = registerListener("order:delete", handleOrderDelete);

    return () => {
      unbindNew();
      unbindUpdate();
      unbindDelete();
    };
  }, [registerListener]);

  const value = useMemo(
    () => ({
      orders,
      setOrders,
      ordersLoading,
      ordersError,
      fetchOrders,
      fetchPaginatedOrders,
      invalidateOrdersCache,
      ordersVersion,
      menuItems,
      setMenuItems,
      menuLoading,
      menuError,
      fetchMenuItems,
    }),
    [
      orders,
      ordersLoading,
      ordersError,
      fetchOrders,
      fetchPaginatedOrders,
      invalidateOrdersCache,
      ordersVersion,
      menuItems,
      menuLoading,
      menuError,
      fetchMenuItems,
    ]
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return ctx;
};
