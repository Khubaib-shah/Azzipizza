import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, ShoppingBag } from "lucide-react";

import Context from "@shared/context/dataContext";
import OrderModal from "../components/Modal/OrderModel";
import CartItem from "../components/CartItem";
import OrderSummaryCard from "../components/OrderSummaryCard";

function Cart() {
  const { cartItems, addToCart, removeFromCart, CartDecrement } =
    useContext(Context);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleQuantityChange = (item, action) => {
    if (action === "increase") {
      addToCart(item, item.selectedIngredients, item.customizations);
    } else if (action === "decrease" && item.quantity > 1) {
      CartDecrement(item);
    }
  };

  return (
    <section aria-label="Shopping cart" className="container relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:pb-16 sm:pt-12">
      <div className="mb-7 flex flex-col gap-5 border-b border-amber-200 pb-6 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-light)] transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[var(--color-primary)]">
              <ShoppingBag size={23} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-dark)]">
                Your order
              </p>
              <h1 className="!m-0 !text-3xl font-bold !text-gray-900 sm:!text-4xl">
                Your cart
              </h1>
            </div>
          </div>
        </div>
        {cartItems.length > 0 && (
          <p className="text-sm text-[var(--color-text-light)] sm:pb-1">
            Review your items before placing your order.
          </p>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-100 bg-white px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[var(--color-accent-dark)]">
            <ShoppingBag size={34} />
          </div>
          <h2 className="!mb-2 !text-2xl font-bold text-[var(--color-text)] sm:!text-3xl">
            Your cart is empty
          </h2>
          <p className="mx-auto mb-7 max-w-md text-sm leading-6 text-[var(--color-text-light)] sm:text-base">
            Find your next favourite and add it to your order. Your selected items will appear here.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2 !px-7 !py-3">
            <ShoppingBag size={17} />
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          <section
            aria-label="Items in your cart"
            className="min-w-0 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/50 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-[var(--color-text)] sm:text-base">
                Your items
              </h2>
              <span className="text-xs text-[var(--color-text-light)] sm:text-sm">
                {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="divide-y divide-amber-100">
              {cartItems.map((item) => (
                <CartItem
                  key={`${item._id}-${JSON.stringify(
                    (item.selectedIngredients || []).map((ing) => ing.name).sort()
                  )}-${item.customizations || ""}`}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
            <div className="border-t border-amber-100 p-4 sm:px-5">
              <Link
                to="/menu"
                className="flex min-h-14 w-full shrink-0 items-center justify-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-4 text-sm font-semibold leading-5 text-[var(--color-primary)] transition-colors hover:border-amber-300 hover:bg-amber-50"
              >
                <Plus size={19} className="shrink-0" />
                <span className="whitespace-nowrap">Add more items</span>
              </Link>
            </div>
          </section>

          <OrderSummaryCard
            cartItems={cartItems}
            onCheckout={openModal}
          />
        </div>
      )}

      <OrderModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        cartItems={cartItems}
      />
    </section>
  );
}

export default Cart;
