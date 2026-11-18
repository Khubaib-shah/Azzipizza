import { useState, useEffect, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  CreditCard,
  ChefHat,
  Building,
  Bell,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Smartphone,
  Lock,
  AlertCircle,
  FileText,
  Flame,
  Pizza,
} from "lucide-react";

import Context from "@shared/context/dataContext";
import { baseUri } from "@shared/config/api";
import { saveOrderToLocalStorage } from "@shared/utils/SavedOrderSucces";
import { useRestaurantStatus } from "@shared/utils/useRestaurantStatus";
import { calculateCartPricing } from "@shared/utils/pricing";
import { Button } from "@shared/components/ui/button";
import Modal from "@shared/components/ui/Modal";

const InputRow = ({
  icon: Icon,
  name,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  className = "",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <div className="relative group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-[var(--color-primary)]">
        <Icon size={16} />
      </div>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-3 focus:ring-amber-500/15 ${error
          ? "border-red-400 bg-red-50/20 focus:border-red-500"
          : "border-slate-200/90 hover:border-slate-300 focus:border-[var(--color-primary)]"
          }`}
        {...props}
      />
    </div>
    {error && (
      <p role="alert" className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

export default function Checkout() {
  const { cartItems, clearCart } = useContext(Context);
  const { isOpen: restaurantOpen } = useRestaurantStatus();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "Bologna",
    zipCode: "",
    doorbellName: "",
    deliveryTimeType: "asap", // "asap" or "scheduled"
    deliveryTime: "",
    customizations: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash", "scan", "bancomat", "paypal"
  const [showSatispayQR, setShowSatispayQR] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const totalItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const pricing = useMemo(() => calculateCartPricing(cartItems), [cartItems]);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 40);
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    setFormData((prev) => ({
      ...prev,
      deliveryTime: `${hours}:${minutes}`,
    }));
  }, []);

  const validateDeliveryTime = (time) => {
    if (formData.deliveryTimeType === "asap") return true;
    if (!time) return false;

    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();
    const minAllowed = new Date(now.getTime() + 30 * 60000);

    const selectedTime = new Date();
    selectedTime.setHours(hour, minute, 0, 0);

    if (selectedTime < now) {
      selectedTime.setDate(selectedTime.getDate() + 1);
    }

    return selectedTime >= minAllowed;
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^\+?[\d\s]{8,15}$/;
    const zipRegex = /^\d{5}$/;

    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Enter a valid phone number";
    }

    if (!formData.street.trim()) errors.street = "Street & house number are required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.zipCode.trim() || !zipRegex.test(formData.zipCode)) {
      errors.zipCode = "5-digit postcode required";
    }
    if (!formData.doorbellName.trim()) {
      errors.doorbellName = "Name on doorbell is required";
    }

    if (formData.deliveryTimeType === "scheduled" && !validateDeliveryTime(formData.deliveryTime)) {
      errors.deliveryTime = "Must be at least 30-40 min in advance";
    }

    if (!paymentMethod) {
      errors.paymentMethod = "Please select a payment method";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "name" || name === "city") {
      sanitizedValue = value.replace(/[^a-zA-ZàèéìòùÀÈÉÌÒÙ\s'-]/g, "");
    } else if (name === "phoneNumber") {
      sanitizedValue = value.replace(/[^0-9+\s]/g, "");
    } else if (name === "zipCode") {
      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 5);
    } else if (name === "street" || name === "doorbellName" || name === "customizations") {
      sanitizedValue = value.replace(/[<>]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOrderSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.warn("Please complete all required fields.", { position: "top-center" });
      return;
    }

    if (!cartItems?.length) {
      toast.error("Your cart is empty!", { position: "top-center" });
      navigate("/cart");
      return;
    }

    setIsSubmitting(true);

    const formattedItems = cartItems.map((item) => ({
      menuItem: item._id,
      name: item.name,
      price: Number(item.price).toFixed(2),
      quantity: item.quantity,
      selectedIngredients: item.selectedIngredients || [],
      customizations: item.customizations || "",
    }));

    const finalDeliveryTime =
      formData.deliveryTimeType === "asap" ? "ASAP (Prima possibile)" : formData.deliveryTime;

    const orderData = {
      items: formattedItems,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      deliveryAddress: {
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
      },
      doorbellName: formData.doorbellName,
      deliveryTime: finalDeliveryTime,
      paymentMethod,
      total: Number(pricing.total.toFixed(2)),
      customizations: formData.customizations || "",
    };

    try {
      if (paymentMethod === "paypal") {
        const response = await baseUri.post("/api/payment/create-payment", orderData);
        if (response.data?.approvalUrl) {
          window.location.href = response.data.approvalUrl;
          return;
        } else {
          toast.error("Failed to initiate PayPal payment.", { position: "top-center" });
          setIsSubmitting(false);
          return;
        }
      }

      const response = await baseUri.post("/api/orders", orderData);
      if (response.status >= 200 && response.status < 300) {
        saveOrderToLocalStorage(response.data);
        clearCart();
        toast.success("Order placed successfully!", { position: "top-center" });
        navigate(`/order-success/${response.data._id}`);
      }
    } catch (error) {
      console.error("Order submit error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to submit order. Please try again.",
        { position: "top-center" }
      );
    } finally {
      if (paymentMethod !== "paypal") {
        setIsSubmitting(false);
      }
    }
  };

  const paymentOptions = [
    {
      id: "cash",
      label: "Cash",
      description: "Pay when your order arrives",
      icon: Banknote,
    },
    {
      id: "scan",
      label: "Satispay",
      description: "Pay with the Satispay app",
      icon: Smartphone,
      hasQR: true,
    },
    {
      id: "bancomat",
      label: "Card on delivery",
      description: "Pay by card",
      icon: CreditCard,
    },
    {
      id: "paypal",
      label: "PayPal",
      description: "Pay online with PayPal",
      icon: ShieldCheck,
    },
  ];

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] px-4 py-16 flex items-center justify-center">
        <div className="mx-auto max-w-lg rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
            <ShoppingBag size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-2 mb-6 text-sm text-slate-500">
            Add delicious pizzas or warm fritti to proceed with your order.
          </p>
          <Link
            to="/menu"
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md"
          >
            <Pizza size={16} /> Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-2 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-6">
        {/* Closed kitchen alert */}
        {!restaurantOpen && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 flex items-center gap-3">
            <ChefHat size={18} className="shrink-0 text-amber-700" />
            <span>
              The oven is currently taking a break. You can still schedule your order for our next opening!
            </span>
          </div>
        )}

        {/* Top Back Link */}
        <div className="mb-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to cart
          </Link>
        </div>

        {/* Master 2-Column Checkout Layout */}
        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* ================= LEFT COLUMN: Compact Details Form ================= */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-3xl border border-amber-100/90 bg-white p-5 sm:p-7 shadow-sm">
              {/* Header */}
              <div className="mb-5 border-b border-slate-100 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                  Secure Checkout
                </p>
                <h1 className="!m-0 font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Delivery details
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Add your details and choose how you’d like to pay.
                </p>

                {/* Compact Steps */}
                <div className="mt-3.5 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-dark)]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold shadow-xs">
                      1
                    </span>
                    Contact
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-dark)]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold shadow-xs">
                      2
                    </span>
                    Delivery
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-dark)]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold shadow-xs">
                      3
                    </span>
                    Payment
                  </span>
                </div>
              </div>

              {/* SECTION 1: Contact Information */}
              <div className="mb-5 rounded-2xl bg-slate-50/60 p-4 border border-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-[var(--color-primary)]">
                    <User size={13} />
                  </span>
                  <h3 className="font-serif text-sm font-bold text-slate-800">
                    Contact information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InputRow
                    icon={User}
                    name="name"
                    placeholder="e.g. Mario Rossi"
                    value={formData.name}
                    onChange={handleChange}
                    error={formErrors.name}
                  />
                  <InputRow
                    icon={Phone}
                    name="phoneNumber"
                    placeholder="Your contact number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={formErrors.phoneNumber}
                  />
                </div>
              </div>

              {/* SECTION 2: Delivery Address */}
              <div className="mb-5 rounded-2xl bg-slate-50/60 p-4 border border-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <MapPin size={13} />
                  </span>
                  <h3 className="font-serif text-sm font-bold text-slate-800">
                    Delivery address
                  </h3>
                </div>
                <div className="space-y-3">
                  <InputRow
                    icon={MapPin}
                    name="street"
                    placeholder="Street and house number"
                    value={formData.street}
                    onChange={handleChange}
                    error={formErrors.street}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InputRow
                      icon={Building}
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      error={formErrors.city}
                    />
                    <InputRow
                      icon={MapPin}
                      name="zipCode"
                      placeholder="Postcode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      error={formErrors.zipCode}
                    />
                  </div>
                  <InputRow
                    icon={Bell}
                    name="doorbellName"
                    placeholder="Name shown on the bell"
                    value={formData.doorbellName}
                    onChange={handleChange}
                    error={formErrors.doorbellName}
                  />
                </div>
              </div>

              {/* SECTION 3: Delivery time & notes */}
              <div className="rounded-2xl bg-slate-50/60 p-4 border border-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Clock size={13} />
                  </span>
                  <h3 className="font-serif text-sm font-bold text-slate-800">
                    Delivery time & notes
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
                  {/* ASAP vs Scheduled mini toggle */}
                  <div className="flex rounded-xl bg-white p-1 border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, deliveryTimeType: "asap" }))
                      }
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${formData.deliveryTimeType === "asap"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-slate-600 hover:text-black"
                        }`}
                    >
                      ASAP (~35-45m)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, deliveryTimeType: "scheduled" }))
                      }
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${formData.deliveryTimeType === "scheduled"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-slate-600 hover:text-black"
                        }`}
                    >
                      Schedule
                    </button>
                  </div>

                  {formData.deliveryTimeType === "scheduled" ? (
                    <div>
                      <input
                        type="time"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-800 shadow-xs focus:border-[var(--color-primary)] focus:outline-none"
                      />
                      {formErrors.deliveryTime && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">
                          {formErrors.deliveryTime}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-slate-500 font-medium px-2">
                      <Flame size={14} className="text-amber-500 mr-1.5 shrink-0" />
                      Baked fresh straight from wood oven
                    </div>
                  )}
                </div>

                <InputRow
                  icon={FileText}
                  name="customizations"
                  placeholder="Notes for kitchen or rider (optional: allergies, gate code...)"
                  value={formData.customizations}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Sticky Summary & Payment ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start z-20">
            <div className="rounded-3xl border border-amber-100/90 bg-white p-5 sm:p-6 shadow-lg shadow-amber-950/5 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
              {/* Summary Header */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-[var(--color-primary)]">
                    <ShoppingBag size={15} />
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Summary
                  </h3>
                </div>
                <Link
                  to="/cart"
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  Edit cart
                </Link>
              </div>

              {/* Items List (Compact) */}
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2 custom-scrollbar mb-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        {item.quantity}×
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 leading-snug">
                          {item.name}
                        </p>
                        {item.selectedIngredients?.length > 0 && (
                          <div className="mt-0.5 space-y-0.5">
                            {item.selectedIngredients.map((ing, i) => (
                              <p key={i} className="text-[10px] text-slate-400">
                                + {ing.name} (€{Number(ing.price).toFixed(2)})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      €{(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-2 border-t border-dashed border-slate-200 py-3 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Products · {totalItemCount} items</span>
                  <span className="font-semibold text-slate-900">
                    €{pricing.productSubtotal.toFixed(2)}
                  </span>
                </div>

                {pricing.extrasTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Extras</span>
                    <span className="font-semibold text-slate-900">
                      €{pricing.extrasTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Offers</span>
                    <span>-€{pricing.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>

                {/* Grand Total */}
                <div className="border-t border-slate-100 pt-2.5 flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 text-sm">Total</span>
                  <span className="font-serif text-2xl font-black text-[var(--color-primary)]">
                    €{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Method Section right in the summary panel */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="mb-2">
                  <h4 className="font-serif text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-red-500" /> Payment method
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Choose your preferred way to pay.
                  </p>
                </div>

                {/* 2x2 Compact Payment Tiles */}
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = paymentMethod === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(opt.id);
                          if (opt.id === "scan") {
                            setShowSatispayQR(true);
                          }
                        }}
                        className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${isSelected
                          ? "border-[var(--color-primary)] bg-red-50/50 shadow-xs ring-1 ring-[var(--color-primary)]/10"
                          : "border-slate-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/20"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Icon size={16} className={isSelected ? "text-[var(--color-primary)]" : "text-slate-500"} />
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${isSelected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                              : "border-slate-300 bg-white"
                              }`}
                          >
                            {isSelected && <span className="h-1 w-1 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] font-bold text-slate-900 leading-tight">
                            {opt.label}
                          </span>
                          <span className="block text-[9px] text-slate-400 leading-tight truncate mt-0.5">
                            {opt.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Satispay QR popup trigger */}
                {paymentMethod === "scan" && (
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowSatispayQR(true)}
                      className="text-[11px] font-bold text-[var(--color-primary)] underline cursor-pointer"
                    >
                      View Satispay QR code
                    </button>
                  </div>
                )}
              </div>

              {/* Place Order CTA Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-11 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/15 hover:shadow-red-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing order...
                  </span>
                ) : (
                  <>
                    <span>Place order · €{pricing.total.toFixed(2)}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </Button>

              {/* Trust Badge */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                <Lock size={11} className="text-slate-400" />
                <span>256-Bit SSL Encrypted & Protected</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Satispay QR Popup Modal */}
      <Modal
        isOpen={showSatispayQR}
        onClose={() => setShowSatispayQR(false)}
        className="max-w-sm"
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[var(--color-primary)]">
            <Smartphone size={22} />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900">
            Pay with Satispay
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Scan the QR code below with your Satispay app to complete the payment of{" "}
            <span className="font-bold text-slate-800">€{pricing.total.toFixed(2)}</span>.
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <img
              src="/QrCode.jpeg"
              alt="Satispay QR Code"
              className="mx-auto w-52 max-w-full rounded-xl shadow-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowSatispayQR(false)}
            className="mt-5 w-full h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
