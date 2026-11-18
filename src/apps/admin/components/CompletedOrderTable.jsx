import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import {
  MapPin,
  Phone,
  MessageCircle,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import TablePagination from "./TablePagination";

const CompletedOrderTable = ({
  filteredOrders,
  handleSelectOrder,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const getStatusBadge = (status) => {
    if (status === "Delivered") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" />
          <span>Delivered</span>
        </span>
      );
    }
    if (status === "Cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md bg-red-50 text-red-700 border border-red-200">
          <XCircle className="h-3 w-3" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  const cleanPhoneForWhatsApp = (phone) => {
    if (!phone) return "";
    let cleaned = phone.replace(/[^0-9]/g, "");
    if (!cleaned.startsWith("39") && cleaned.length >= 9) {
      cleaned = "39" + cleaned;
    }
    return cleaned;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 text-xs font-medium text-slate-500 pl-4 w-28">
                Order
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[170px]">
                Customer
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[200px]">
                Address
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[220px]">
                Items
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[110px]">
                Payment
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 text-right">
                Total
              </TableHead>
              <TableHead className="h-10 text-xs font-medium text-slate-500 text-center pr-4">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order, index) => {
              const waPhone = cleanPhoneForWhatsApp(order.phoneNumber);
              const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString([], {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : null;
              const orderTime = order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <TableRow
                  key={order._id || `comp-order-${index}`}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100"
                  onClick={() => handleSelectOrder(order)}
                >
                  <TableCell className="pl-4 py-3 align-top">
                    <div className="font-mono text-xs text-slate-700 font-semibold">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    {orderDate && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {orderDate} at {orderTime}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 align-top">
                    <div className="font-medium text-slate-900 text-xs">
                      {order.name || "Customer"}
                    </div>
                    {order.phoneNumber && (
                      <div
                        className="flex items-center gap-2 mt-1 text-[11px] text-slate-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`tel:${order.phoneNumber}`}
                          className="hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                          title="Call"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{order.phoneNumber}</span>
                        </a>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-md transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="py-3 align-top">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-medium text-slate-700 leading-snug">
                          {order.deliveryAddress?.street || "Pickup"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {order.deliveryAddress?.city}{" "}
                          {order.deliveryAddress?.zipCode ? `(${order.deliveryAddress.zipCode})` : ""}
                        </div>
                        {order.doorbellName && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Bell: {order.doorbellName}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-top">
                    <div className="space-y-0.5 max-w-xs">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-600 flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-slate-800 bg-slate-100 px-1 rounded text-[11px]">
                            {item.quantity}x
                          </span>
                          <span className="truncate">
                            {item.name || item.menuItem?.name || "Pizza"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-top">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                      {order.paymentMethod === "cash" ? (
                        <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                      )}
                      <span className="uppercase">{order.paymentMethod || "cash"}</span>
                    </div>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium rounded border ${
                        order.paymentStatus === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {order.paymentStatus === "Completed" ? "Paid" : "Unpaid"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 align-top text-right font-semibold tabular-nums text-slate-900 text-sm">
                    €{parseFloat(order.totalPrice || order.totalAmount || order.total || 0).toFixed(2)}
                  </TableCell>

                  <TableCell className="py-3 align-top text-center pr-4">
                    <div className="flex flex-col items-center gap-1">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {onPageChange && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};

export default CompletedOrderTable;
