import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { calculateCartPricing } from "@shared/utils/pricing";

const OrderSummaryCard = ({ cartItems, onCheckout }) => {
  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const pricing = calculateCartPricing(cartItems);

  return (
    <aside className="rounded-2xl border border-amber-100 bg-white p-5 shadow-md sm:p-7 xl:sticky xl:top-24">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-['Playfair_Display'] text-xl font-bold text-[var(--color-text)] sm:text-2xl">
            Order summary
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-light)]">
            {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
          <ShoppingBag size={20} />
        </div>
      </div>

      <div className="space-y-4 border-t border-dashed border-amber-200 py-5 font-['Poppins']">
        <div className="flex justify-between gap-4 text-sm text-[var(--color-text-light)]">
          <span>Products</span>
          <span className="font-medium text-[var(--color-text)]">€{pricing.productSubtotal.toFixed(2)}</span>
        </div>
        {pricing.extrasTotal > 0 && (
          <div className="flex justify-between gap-4 text-sm text-[var(--color-text-light)]">
            <span>Extras</span>
            <span className="font-medium text-[var(--color-text)]">€{pricing.extrasTotal.toFixed(2)}</span>
          </div>
        )}
        {pricing.discount > 0 && (
          <div className="flex justify-between gap-4 text-sm text-[var(--color-basil)]">
            <span>Offers</span>
            <span className="font-semibold">−€{pricing.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 text-sm text-[var(--color-text-light)]">
          <span>Delivery</span>
          <span className="font-semibold text-[var(--color-basil)]">Free</span>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
          <span className="font-semibold text-[var(--color-text)]">Total</span>
          <span className="font-['Playfair_Display'] text-3xl font-bold text-[var(--color-primary)]">
            €{pricing.total.toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        className="btn-primary h-auto min-h-14 w-full cursor-pointer whitespace-normal px-4 py-4 text-center text-base leading-tight shadow-md transition-transform hover:-translate-y-0.5 sm:text-lg"
      >
        <span className="min-w-0">Continue to checkout</span>
        <ArrowRight size={19} />
      </Button>
      <p className="mt-3 text-center text-xs text-[var(--color-text-light)]">
        Choose your payment method at checkout
      </p>
    </aside>
  );
};

export default OrderSummaryCard;
