import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { PaymentModal } from "../PaymentOptionButtons";
import { baseUri } from "@shared/config/api";
import { saveOrderToLocalStorage } from "@shared/utils/SavedOrderSucces";
import { useRestaurantStatus } from "@shared/utils/useRestaurantStatus";
import { calculateCartPricing } from "@shared/utils/pricing";
import {
  User,
  Phone,
  MapPin,
  Clock,
  StickyNote,
  ShoppingBag,
  CreditCard,
  ChefHat,
  Building
} from "lucide-react";

// InputField defined outside to prevent re-renders losing focus
const InputField = ({ icon: Icon, name, label, placeholder, value, onChange, error, type = "text", className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-slate-700">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors group-focus-within:text-[var(--color-primary)]">
        <Icon size={17} className="text-gray-400 group-focus-within:text-[var(--color-primary)]" />
      </div>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 transition-all focus:ring-2 focus:ring-amber-100 ${error
          ? "border-red-300 bg-red-50 focus:border-red-500"
          : "border-gray-200 focus:border-[var(--color-primary)] hover:border-gray-300"
          }`}
        {...props}
      />
    </div>
    {error && (
      <p id={`${name}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">
        {error}
      </p>
    )}
  </div>
);

function OrderModal({ isOpen, closeModal, cartItems }) {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    zipCode: "",
    customizations: "",
    doorbellName: "",
    deliveryTime: "",
  });
  const { isOpen: restaurantOpen } = useRestaurantStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isTime, setIsTime] = useState(false);
  const navigate = useNavigate();
  const totalItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const pricing = useMemo(() => calculateCartPricing(cartItems), [cartItems]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        phoneNumber: "",
        street: "",
        city: "",
        zipCode: "",
        customizations: "",
        doorbellName: "",
        deliveryTime: "",
      });
      setFormErrors({});
      setIsTime(restaurantOpen);

      const now = new Date();
      now.setMinutes(now.getMinutes() + 40);

      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const defaultTime = `${hours}:${minutes}`;

      setFormData((prev) => ({
        ...prev,
        deliveryTime: defaultTime,
      }));
    }
  }, [isOpen, restaurantOpen]);

  const validateDeliveryTime = (time) => {
    if (!time) return false;

    const [hour, minute] = time.split(":").map(Number);

    const now = new Date();
    const minAllowed = new Date(now.getTime() + 35 * 60000);

    const selectedTime = new Date();
    selectedTime.setHours(hour, minute, 0, 0);

    // ✅ FIX — if selected clock time already passed today, treat as tomorrow
    if (selectedTime < now) {
      selectedTime.setDate(selectedTime.getDate() + 1);
    }

    return selectedTime >= minAllowed;
  };

  const isFormValid = useMemo(() => {
    // Relaxed Phone: Allows + leading, then 8-15 digits
    const phoneRegex = /^\+?[\d\s]{8,15}$/;
    // Relaxed Zip: Allow any 5 digit number
    const zipRegex = /^\d{5}$/;

    return (
      formData.name.trim().length > 0 &&
      phoneRegex.test(formData.phoneNumber) &&
      formData.street.trim().length > 0 &&
      formData.city.trim().length > 0 &&
      zipRegex.test(formData.zipCode) &&
      formData.doorbellName.trim().length > 0 &&
      validateDeliveryTime(formData.deliveryTime)
    );
  }, [formData]);

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^\+?[\d\s]{8,15}$/;
    const zipRegex = /^\d{5}$/;

    if (!formData.name.trim()) errors.name = "Full Name is Required";

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "WhatsApp No. is Required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Invalid WhatsApp No.";
    }

    if (!formData.street.trim()) errors.street = "Street Address is Required";
    if (!formData.city.trim()) errors.city = "City is Required";

    if (!formData.zipCode.trim()) {
      errors.zipCode = "ZIP is Required";
    } else if (!zipRegex.test(formData.zipCode)) {
      errors.zipCode = "Must be 5 digits";
    }

    if (!formData.doorbellName.trim()) errors.doorbellName = "Doorbell is Required";

    // Time validation remains, but now invalid time will show explicit error below field
    if (!validateDeliveryTime(formData.deliveryTime)) {
      errors.deliveryTime = "Too soon";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "name" || name === "city") {
      // Only alphabets and spaces
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phoneNumber") {
      // Only numbers
      sanitizedValue = value.replace(/[^0-9]/g, "");
    } else if (name === "zipCode") {
      // Only up to 5 numbers
      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 5);
    } else if (name === "street" || name === "doorbellName" || name === "customizations") {
      // Basic sanitization
      sanitizedValue = value.replace(/[<>]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleKeyDownNumbers = (e) => {
    // Prevent typing 'e', 'E', '+', '-', '.'
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleOrderSubmit = async (method) => {
    if (!validateForm()) return;

    if (!cartItems?.length) {
      toast.error("Your cart is empty!", { position: "top-center" });
      return;
    }

    setIsSubmitting(true);

    const formattedItems = cartItems.map((item) => ({
      menuItem: item._id,
      name: item.name,
      price: Number(item.price).toFixed(2),
      quantity: item.quantity,
      selectedIngredients: item.selectedIngredients || [],
    }));

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
      deliveryTime: formData.deliveryTime,
      paymentMethod: method,
      total: Number(pricing.total.toFixed(2)),
      customizations: formData.customizations || "",
    };

    try {
      let response;

      if (method === "paypal") {
        console.log("Order Data:", orderData);
        console.log("Base URI:", baseUri);
        response = await baseUri.post("/api/payment/create-payment", orderData);
        console.log("Response Data:", response.data);
        console.log("PayPal Response:", response);
        if (response.status >= 400) {
          toast.error(response.data.message, { position: "top-center" });
          setIsSubmitting(false);
          return;
        }
        if (response.status >= 200 && response.status < 300 && response.data.approvalUrl) {
          console.log("Redirecting to:", response.data.approvalUrl);
          window.location.href = response.data.approvalUrl;
          setIsSubmitting(false);
          return;
        } else {
          console.error("PayPal Error Condition Met:", response);
          toast.error("Failed to start direct paypal payment", {
            position: "top-center",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (["scan", "bancomat", "cash"].includes(method)) {
        response = await baseUri.post("/api/orders", orderData);
        if (response.status >= 200 && response.status < 300) {
          saveOrderToLocalStorage(response.data);
          closeModal();
          setTimeout(() => {
            navigate(
              `/order-success/${response.data._id}`
            );
          }, 50);
          return;
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error?.response?.data?.message || "Failed to process order", {
        position: "top-center",
      });
    } finally {
      if (method !== "paypal") {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-5xl !overflow-hidden !p-0">
      {!isTime ? (
        <div className="text-center py-20 px-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <ChefHat size={48} className="text-gray-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4 font-['Playfair_Display'] text-[var(--color-text)]">
            Kitchen is Closed
          </h2>
          <p className="text-[var(--color-text-light)] text-xl mb-10 font-['Poppins'] max-w-md">
            We're currently taking a break. Come back later for the best pizza in town!
          </p>
          <button
            onClick={closeModal}
            className="px-8 py-3 bg-[var(--color-text)] text-white rounded-full hover:bg-black transition-colors font-medium text-lg"
          >
            I'll be back
          </button>
        </div>
      ) : (
        <div className="flex max-h-[95vh] flex-col overflow-y-auto font-['Poppins'] lg:max-h-[90vh] lg:flex-row lg:overflow-hidden">
          <div className="min-w-0 flex-1 bg-white p-5 sm:p-7 lg:max-h-[90vh] lg:overflow-y-auto lg:p-9">
            <div className="mb-7 border-b border-amber-100 pb-5 pr-10">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                Secure checkout
              </p>
              <h2 className="!mb-1 !text-3xl font-bold text-slate-900 sm:!text-4xl">
                Delivery details
              </h2>
              <p className="text-sm text-slate-500">
                Add your details and choose how you’d like to pay.
              </p>
              <ol aria-label="Checkout steps" className="mt-5 grid grid-cols-3 gap-2">
                {["Contact", "Delivery", "Payment"].map((step, index) => (
                  <li key={step} className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[var(--color-accent-dark)]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-3 !text-base font-bold text-slate-900 sm:!text-lg">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
                    <User size={18} />
                  </span>
                  Contact information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    icon={User}
                    name="name"
                    label="Full name"
                    placeholder="e.g. Mario Rossi"
                    value={formData.name}
                    onChange={handleChange}
                    error={formErrors.name}
                  />
                  <InputField
                    icon={Phone}
                    name="phoneNumber"
                    label="Phone number"
                    type="tel"
                    placeholder="Your contact number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onKeyDown={handleKeyDownNumbers}
                    error={formErrors.phoneNumber}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-3 !text-base font-bold text-slate-900 sm:!text-lg">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
                    <MapPin size={18} />
                  </span>
                  Delivery address
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      icon={MapPin}
                      name="street"
                      label="Street address"
                      placeholder="Street and house number"
                      value={formData.street}
                      onChange={handleChange}
                      error={formErrors.street}
                      className="sm:col-span-2"
                    />
                    <InputField
                      icon={Building}
                      name="city"
                      label="City"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      error={formErrors.city}
                    />
                    <InputField
                      icon={MapPin}
                      name="zipCode"
                      label="Postcode"
                      type="number"
                      placeholder="Postcode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onKeyDown={handleKeyDownNumbers}
                      error={formErrors.zipCode}
                    />
                    <InputField
                      icon={User}
                      name="doorbellName"
                      label="Name on doorbell"
                      placeholder="Name shown on the bell"
                      value={formData.doorbellName}
                      onChange={handleChange}
                      error={formErrors.doorbellName}
                      className="sm:col-span-2"
                    />
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-3 !text-base font-bold text-slate-900 sm:!text-lg">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
                    <Clock size={18} />
                  </span>
                  Delivery time & notes
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="deliveryTime" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Preferred delivery time
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-[var(--color-primary)]">
                        <Clock size={17} />
                      </div>
                      <input
                        id="deliveryTime"
                        type="time"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleChange}
                        aria-invalid={Boolean(formErrors.deliveryTime)}
                        aria-describedby={formErrors.deliveryTime ? "deliveryTime-error" : undefined}
                        className={`w-full rounded-xl border bg-white py-3 pl-11 pr-3 text-sm text-gray-800 transition-all focus:ring-2 focus:ring-amber-100 ${formErrors.deliveryTime
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-[var(--color-primary)] hover:border-gray-300"
                          }`}
                      />
                    </div>
                    {formErrors.deliveryTime && (
                      <p id="deliveryTime-error" role="alert" className="mt-1 text-xs font-medium text-red-600">
                        Choose a time at least 35 minutes from now.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customizations" className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Order notes <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      id="customizations"
                      name="customizations"
                      placeholder="Allergies, delivery instructions, or anything else we should know"
                      value={formData.customizations}
                      onChange={handleChange}
                      className="min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-amber-100"
                      rows="3"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Validation Message Area */}
            <div className="h-4 mt-2">
              {Object.keys(formErrors).length > 0 && (
                <p className="text-red-500 text-xs text-center animate-pulse">
                  * Please check the highlighted fields
                </p>
              )}
            </div>
          </div>
          {/* Right Column: Order Summary & Payment */}
          <div className="flex w-full shrink-0 flex-col justify-between overflow-y-auto border-t border-red-100 bg-red-50/50 p-5 sm:p-6 lg:max-h-[90vh] lg:w-[380px] lg:border-l lg:border-t-0 lg:rounded-r-[2rem] lg:p-8">
            <div className="mb-5 lg:mb-8">
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-800 mb-3 md:mb-6 flex items-center gap-3 tracking-tight">
                <ShoppingBag size={24} className="text-red-500" />
                Summary
              </h3>

              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
                <ul className="mb-4 max-h-44 space-y-3 overflow-y-auto border-b border-dashed border-amber-100 pb-4">
                  {cartItems.map((item, index) => (
                    <li
                      key={`${item._id}-${(item.selectedIngredients || []).map((ingredient) => ingredient.name).sort().join(",")}-${item.customizations || ""}-${index}`}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div className="flex min-w-0 gap-2">
                        <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-dark)]">
                          {item.quantity}×
                        </span>
                        <div className="min-w-0">
                          <p className="break-words font-medium leading-5 text-slate-800">
                            {item.name}
                          </p>
                          {item.selectedIngredients?.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {item.selectedIngredients.map((ingredient) => (
                                <li
                                  key={ingredient._id || ingredient.name}
                                  className="flex flex-wrap justify-between gap-x-2 text-xs leading-4 text-slate-500"
                                >
                                  <span>{ingredient.name}</span>
                                  <span>
                                    €{ingredient.price.toFixed(2)} × {item.quantity} = €{(ingredient.price * item.quantity).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 font-medium text-slate-700">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3 text-slate-600">
                    <span>
                      Products · {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                    </span>
                    <span>€{pricing.productSubtotal.toFixed(2)}</span>
                  </div>
                  {pricing.extrasTotal > 0 && (
                    <div className="flex justify-between gap-3 text-slate-600">
                      <span>Extras</span>
                      <span>€{pricing.extrasTotal.toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between gap-3 text-[var(--color-basil)]">
                      <span>Offers</span>
                      <span className="font-semibold">−€{pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-3 text-slate-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-[var(--color-basil)]">Free</span>
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-3">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="font-['Playfair_Display'] text-2xl font-bold text-[var(--color-primary)]">
                      €{pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <div>
                <h4 className="flex items-center gap-2 font-bold text-slate-900">
                  <CreditCard size={18} className="text-[var(--color-primary)]" />
                  Payment method
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Choose your preferred way to pay.
                </p>
              </div>
              <PaymentModal
                totalPrice={pricing.total}
                isSubmitting={isSubmitting}
                handleOrderSubmit={handleOrderSubmit}
                isFormValid={isFormValid}
              />
            </div>
          </div>
        </div>
      )}
    </Modal >
  );
}

export default OrderModal;
