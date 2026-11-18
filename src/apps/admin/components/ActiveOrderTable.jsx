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
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Bell,
  CheckCircle2,
  ChefHat,
  Truck,
  CreditCard,
  Banknote,
  AlertCircle,
  ChevronRight,
  Pizza,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import TablePagination from "./TablePagination";

const ActiveOrderTable = ({
  filteredOrders,
  handleSelectOrder,
  onStatusChange,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentBadge = (method, status) => {
    const isPaid = status === "Completed";
    const methodUpper = (method || "cash").toUpperCase();
    const isCash = method === "cash";

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800">
          {isCash ? (
            <Banknote className="h-3 w-3 text-emerald-600" />
          ) : (
            <CreditCard className="h-3 w-3 text-blue-600" />
          )}
          <span>{methodUpper}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md w-fit border ${
            isPaid
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
          }`}
        >
          {isPaid ? "Pagato" : "Da Incassare"}
        </span>
      </div>
    );
  };

  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return {
          next: "Preparing",
          label: "Inizia Prep.",
          icon: ChefHat,
          className:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200",
        };
      case "Preparing":
        return {
          next: "Out for Delivery",
          label: "In Consegna",
          icon: Truck,
          className:
            "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200",
        };
      case "Out for Delivery":
        return {
          next: "Delivered",
          label: "Consegnato",
          icon: CheckCircle2,
          className:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200",
        };
      default:
        return null;
    }
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
            <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[120px]">
              Time / ETA
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-slate-500 min-w-[110px]">
              Payment
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-slate-500 text-right">
              Total
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-slate-500 text-center pr-4 min-w-[150px]">
              Quick Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders
            .filter(
              (order) =>
                order.orderStatus !== "Delivered" &&
                order.orderStatus !== "Cancelled"
            )
            .map((order, index) => {
              const nextAction = getNextStatusAction(order.orderStatus);
              const waPhone = cleanPhoneForWhatsApp(order.phoneNumber);
              const placedTime = order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <TableRow
                  key={order._id || `order-${index}`}
                  className="cursor-pointer hover:bg-red-50/40 transition-colors border-b border-slate-100 group"
                  onClick={() => handleSelectOrder(order)}
                >
                  {/* Order ID & Placed time */}
                  <TableCell className="pl-4 py-3 align-top">
                    <div className="font-mono text-xs text-red-600 font-black">
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    {placedTime && (
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Ore {placedTime}
                      </div>
                    )}
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </TableCell>

                  {/* Customer info & Quick Contact */}
                  <TableCell className="py-3 align-top">
                    <div className="font-bold text-slate-900 text-xs">
                      {order.name || "Cliente"}
                    </div>
                    {order.phoneNumber && (
                      <div
                        className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`tel:${order.phoneNumber}`}
                          className="hover:text-red-600 flex items-center gap-1 font-bold transition-colors"
                          title="Chiama cliente"
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
                            title="Messaggio WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </TableCell>

                  {/* Delivery Address & Doorbell */}
                  <TableCell className="py-3 align-top">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-bold text-slate-800 leading-snug">
                          {order.deliveryAddress?.street || "Ritiro / Indirizzo n/d"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {order.deliveryAddress?.city}{" "}
                          {order.deliveryAddress?.zipCode ? `(${order.deliveryAddress.zipCode})` : ""}
                        </div>
                        {order.doorbellName && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 w-fit">
                            <Bell className="h-2.5 w-2.5" />
                            <span>Campanello: {order.doorbellName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Items Summary */}
                  <TableCell className="py-3 align-top">
                    <div className="space-y-1 max-w-xs">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-slate-700 font-medium flex items-start gap-1.5"
                        >
                          <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-800">
                            {item.name || item.menuItem?.name || "Pizza"}
                          </span>
                          {item.selectedIngredients?.length > 0 && (
                            <span className="text-[10px] text-slate-400 italic">
                              (+{item.selectedIngredients.map((i) => i.name).join(", ")})
                            </span>
                          )}
                        </div>
                      ))}
                      {order.description && (
                        <div className="text-[10px] text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-100 italic mt-1">
                          Nota: {order.description}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Delivery Time & Live ETA */}
                  <TableCell className="py-3 align-top">
                    {order.deliveryTime ? (
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                        <Clock className="h-3 w-3 text-red-500" />
                        <span>
                          {typeof order.deliveryTime === "string" && !order.deliveryTime.includes("T")
                            ? order.deliveryTime
                            : new Date(order.deliveryTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        ASAP (Subito)
                      </span>
                    )}

                    {order.eta && (
                      <div className="flex items-center text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 w-fit mt-1.5">
                        <Clock className="h-2.5 w-2.5 mr-1 animate-pulse" />
                        <span>
                          {Math.max(
                            0,
                            Math.floor((new Date(order.eta) - Date.now()) / 60000)
                          )}{" "}
                          min
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* Payment Info */}
                  <TableCell className="py-3 align-top">
                    {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                  </TableCell>

                  {/* Total */}
                  <TableCell className="py-3 align-top text-right font-serif font-black text-slate-900 text-sm">
                    €{parseFloat(order.totalPrice || order.totalAmount || order.total || 0).toFixed(2)}
                  </TableCell>

                  {/* Quick Action Button */}
                  <TableCell className="py-3 align-top text-center pr-4">
                    <div
                      className="flex flex-col gap-1 items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {nextAction && onStatusChange ? (
                        <Button
                          size="sm"
                          className={`h-7 px-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer ${nextAction.className}`}
                          onClick={() => onStatusChange(order._id, nextAction.next)}
                        >
                          <nextAction.icon className="h-3 w-3" />
                          <span>{nextAction.label}</span>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {order.orderStatus}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-bold text-slate-400 hover:text-red-600 hover:bg-slate-50 px-2 flex items-center gap-1"
                        onClick={() => handleSelectOrder(order)}
                      >
                        Dettagli <ChevronRight className="h-2.5 w-2.5" />
                      </Button>
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

export default ActiveOrderTable;
