import { useEffect, useState } from "react";
import QrCodeModal from "./Modal/QrCodeModal";
import { ArrowRight, Banknote, CreditCard, Smartphone } from "lucide-react";
import { AnimatePresence } from "framer-motion";
export function PaymentModal({ isSubmitting, handleOrderSubmit, totalPrice }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [qrCodeModal, setQrCodeModal] = useState(false);

  const paymentOptions = [
    { value: "cash", label: "Cash", description: "Pay when your order arrives", icon: Banknote },
    { value: "scan", label: "Satispay", description: "Pay with the Satispay app", icon: Smartphone },
    { value: "bancomat", label: "Card on delivery", description: "Pay by card at your door", icon: CreditCard },
    { value: "paypal", label: "PayPal", description: "Pay online with PayPal", icon: CreditCard },
  ];

  useEffect(() => {
    setQrCodeModal(paymentMethod === "scan");
  }, [paymentMethod]);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = paymentMethod === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPaymentMethod(option.value)}
              disabled={isSubmitting}
              aria-pressed={isSelected}
              className={`flex min-h-[76px] cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? "border-[var(--color-primary)] bg-red-50/60 shadow-sm ring-1 ring-[var(--color-primary)]/10"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isSelected ? "bg-red-100 text-[var(--color-primary)]" : "bg-gray-100 text-gray-500"
              }`}>
                <Icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                  {option.description}
                </span>
              </span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-gray-300 bg-white"
              }`}>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Show QR Code Inline if Satispay is selected */}
      <AnimatePresence>
        {qrCodeModal && (
          <QrCodeModal totalPrice={totalPrice} setQrCodeModal={setQrCodeModal} />
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => handleOrderSubmit(paymentMethod)}
        disabled={isSubmitting || !paymentMethod}
        className={`flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-4 text-center text-sm font-bold leading-tight text-white shadow-sm transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none ${
          !isSubmitting && paymentMethod
            ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
            : ""
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <>
            <span>
              {paymentMethod
                ? `Place order · €${totalPrice.toFixed(2)}`
                : "Select a payment method"}
            </span>
            {paymentMethod && <ArrowRight size={17} />}
          </>
        )}
      </button>
    </div>
  );
}
