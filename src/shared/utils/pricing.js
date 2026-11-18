export const normalizeDiscountPercent = (value) => {
  if (typeof value === "string") {
    const match = value.trim().match(/^-?\d+(?:\.\d+)?\s*%?$/);
    if (!match) return 0;
    value = Number(match[0].replace("%", "").trim());
  }

  const percent = Number(value);
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.abs(percent));
};

export const calculateDiscountedPrice = (price, discountPercent) => {
  const priceInCents = Math.round(Number(price) * 100);
  const discount = normalizeDiscountPercent(discountPercent);
  return Math.round((priceInCents * (100 - discount)) / 100) / 100;
};

export const calculateUnitPrice = (discountedBasePrice, extras = []) => {
  const basePriceInCents = Math.round(Number(discountedBasePrice) * 100);
  const extrasInCents = extras.reduce(
    (total, extra) => total + Math.round(Number(extra.price) * 100),
    0,
  );
  return (basePriceInCents + extrasInCents) / 100;
};

export const calculateCartPricing = (cartItems = []) => {
  const totals = cartItems.reduce(
    (summary, item) => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const discount = normalizeDiscountPercent(item.discount);
      const extrasInCents = (item.selectedIngredients || []).reduce(
        (total, extra) => total + Math.round(Number(extra.price) * 100),
        0,
      );
      const storedUnitPriceInCents = Math.round(Number(item.price) * 100);
      const hasOriginalPrice =
        item.originalPrice != null && Number.isFinite(Number(item.originalPrice));

      let originalBaseInCents;
      if (hasOriginalPrice) {
        originalBaseInCents = Math.round(Number(item.originalPrice) * 100);
      } else {
        const discountedBaseInCents = Math.max(
          0,
          storedUnitPriceInCents - extrasInCents,
        );
        originalBaseInCents =
          discount > 0 && discount < 100
            ? Math.round((discountedBaseInCents * 100) / (100 - discount))
            : discountedBaseInCents;
      }

      const discountedBaseInCents = Math.round(
        (originalBaseInCents * (100 - discount)) / 100,
      );
      const lineSubtotalInCents =
        (originalBaseInCents + extrasInCents) * quantity;
      const lineProductSubtotalInCents = originalBaseInCents * quantity;
      const lineExtrasTotalInCents = extrasInCents * quantity;
      const lineDiscountInCents =
        (originalBaseInCents - discountedBaseInCents) * quantity;

      return {
        productSubtotalInCents:
          summary.productSubtotalInCents + lineProductSubtotalInCents,
        extrasTotalInCents:
          summary.extrasTotalInCents + lineExtrasTotalInCents,
        subtotalInCents: summary.subtotalInCents + lineSubtotalInCents,
        discountInCents: summary.discountInCents + lineDiscountInCents,
      };
    },
    {
      productSubtotalInCents: 0,
      extrasTotalInCents: 0,
      subtotalInCents: 0,
      discountInCents: 0,
    },
  );

  return {
    productSubtotal: totals.productSubtotalInCents / 100,
    extrasTotal: totals.extrasTotalInCents / 100,
    subtotal: totals.subtotalInCents / 100,
    discount: totals.discountInCents / 100,
    total: (totals.subtotalInCents - totals.discountInCents) / 100,
  };
};
