import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import {
  calculateDiscountedPrice,
  normalizeDiscountPercent,
} from "@shared/utils/pricing";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const itemTotal = item.price * item.quantity;
  const discount = normalizeDiscountPercent(item.discount);
  const originalPrice = Number(item.originalPrice);
  const hasOriginalPrice =
    item.originalPrice != null && Number.isFinite(originalPrice);

  return (
    <article className="group flex gap-3 bg-white p-3 transition-colors hover:bg-amber-50/30 sm:gap-4 sm:p-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-amber-50 sm:h-24 sm:w-24">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 lg:group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute left-2 top-2 rounded-full bg-[var(--color-basil)] px-2 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
            -{discount}% OFF
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words font-['Playfair_Display'] !text-base font-bold leading-tight text-[var(--color-text)] sm:!text-lg">
              {item.name}
            </h3>
            {discount > 0 && hasOriginalPrice ? (
              <p className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-[var(--color-text-light)] sm:text-sm">
                <span className="line-through">€{originalPrice.toFixed(2)}</span>
                <span aria-hidden="true">→</span>
                <span className="font-semibold text-[var(--color-primary)]">
                  €{calculateDiscountedPrice(originalPrice, discount).toFixed(2)} (-{discount}%)
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-light)] sm:text-sm">
                €{item.price.toFixed(2)} per pizza
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-lighter)] sm:text-xs">
              Item total
            </p>
            <p className="font-['Playfair_Display'] text-base font-bold text-[var(--color-primary)] sm:text-lg">
              €{itemTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {item.selectedIngredients?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {item.selectedIngredients.map((ingredient) => (
              <li
                key={ingredient._id || ingredient.name}
                className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-[var(--color-text-light)] sm:text-sm"
              >
                <span>{ingredient.name}</span>
                <span className="font-medium text-[var(--color-accent-dark)]">
                  €{((Math.round(ingredient.price * 100) * item.quantity) / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {item.customizations && (
          <p className="mt-2 text-xs text-[var(--color-text-light)]">
            <span className="font-semibold text-[var(--color-text)]">Note:</span>{" "}
            {item.customizations}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="inline-flex items-center rounded-full border border-amber-200 bg-[var(--color-background)] p-1">
            <Button
              onClick={() => onQuantityChange(item, "decrease")}
              aria-label={`Decrease ${item.name} quantity`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white p-0 text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-primary-light)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[var(--color-text)]"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </Button>
            <span aria-live="polite" className="w-9 text-center text-sm font-semibold text-[var(--color-text)]">
              {item.quantity}
            </span>
            <Button
              onClick={() => onQuantityChange(item, "increase")}
              aria-label={`Increase ${item.name} quantity`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-accent)] p-0 text-white shadow-sm transition-colors hover:bg-[var(--color-accent-dark)]"
            >
              <Plus size={14} />
            </Button>
          </div>
          <Button
            onClick={() => onRemove(item)}
            aria-label="Remove item from cart"
            title={`Remove ${item.name}`}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-white p-0 text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-red-50 sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
          >
            <Trash2 size={16} />
            <span className="hidden text-sm font-medium sm:block">Remove</span>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
