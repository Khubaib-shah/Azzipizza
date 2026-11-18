import { FaPlus, FaStar } from "react-icons/fa";
import { Minus, Plus } from "lucide-react";
import { lazy, Suspense, useContext, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import Context from "@shared/context/dataContext";
import { toast } from "react-toastify";
import { getOptimizedImageUrl } from "@shared/utils/cloudinary";
import { Button } from "@shared/components/ui/button";
import {
  calculateDiscountedPrice,
  calculateUnitPrice,
  normalizeDiscountPercent,
} from "@shared/utils/pricing";
const Modal = lazy(() => import("../Modal/Modal"));

const ProductCard = memo(({ product }) => {
  const { addToCart } = useContext(Context);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [itemNote, setItemNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const discount = normalizeDiscountPercent(product.discount);
  const basePrice = Number(product.price);
  const discountedPrice = useMemo(
    () => calculateDiscountedPrice(basePrice, discount),
    [basePrice, discount],
  );
  const rating = useMemo(() => product.rating || 4.5, [product.rating]);

  const finalPrice = useMemo(
    () => calculateUnitPrice(discountedPrice, selectedToppings),
    [discountedPrice, selectedToppings],
  );
  const modalTotalPrice = finalPrice * quantity;

  const handleToppingToggle = (e, topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((item) => item._id === topping._id);
      return exists
        ? prev.filter((item) => item._id !== topping._id)
        : [...prev, topping];
    });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cartItem = {
      ...product,
      discount,
      originalPrice: basePrice,
      price: finalPrice,
    };
    const trimmedNote = itemNote.trim();
    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem, selectedToppings, trimmedNote);
    }
    toast.success(`${quantity}× ${product.name} added to cart`);
    setSelectedToppings([]);
    setItemNote("");
    setQuantity(1);
  };
  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedToppings([]);
    setItemNote("");
    setQuantity(1);
  };

  // Determine if item is special (derived from product data, not random)
  const isNew = product.isNew || false;
  const isChefSpecial =
    product.isChefSpecial ||
    product.category?.toLowerCase().includes("special");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      {/* Scroll-animated Entrance Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full"
      >
        {/* Compact Card */}
        <div
          className="group relative md:bg-white rounded-sm md:rounded-2xl shadow-sm lg:hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full transform-gpu lg:hover:-translate-y-1 active:scale-95 will-change-transform"
          onClick={() => setIsModalOpen(true)}
          style={{ contain: "layout" }}
        >
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {isChefSpecial && (
              <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <FaStar size={8} /> Special
              </span>
            )}
          </div>

          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
            <img
              loading="lazy"
              decoding="async"
              src={getOptimizedImageUrl(product.image, 400)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 lg:group-hover:scale-110"
            />

            {/* Quick View Overlay (Desktop only) */}
            <div className="absolute inset-0 bg-black/20 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-end justify-center pb-4">
              <Button
                className="bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 hover:bg-[var(--color-primary)] hover:text-white border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                Quick View
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-2 sm:p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="!font-bold text-gray-900 !text-sm sm:text-xl font-['Playfair_Display'] leading-tight line-clamp-2 break-words lg:group-hover:text-[var(--color-primary)] transition-colors">
                {product.name}
              </h3>
              <div className="hidden md:flex shrink-0 items-center gap-1 text-[10px] sm:text-xs text-gray-600 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-gray-100 mt-0.5">
                <FaStar className="text-amber-400" size={10} />
                <span className="font-medium">{rating}</span>
              </div>
            </div>

            {/* <p className="text-[11px] sm:text-sm text-gray-500 line-clamp-2 mb-3 sm:mb-4 leading-relaxed flex-grow">
            {product.description}
          </p> */}

            <div className="mt-auto flex flex-col gap-2 border-t border-gray-50 border-dashed pt-2 sm:flex-row sm:items-end sm:justify-between sm:gap-2 sm:pt-4">
              <div className="flex flex-col">
                {discount > 0 && (
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through mb-0.5">
                    €{basePrice.toFixed(2)}
                  </span>
                )}
                <span className="font-bold text-sm sm:text-xl text-[var(--color-primary)] leading-none">
                  €{discountedPrice.toFixed(2)}
                </span>
              </div>

              <Button
                className="bg-[var(--color-primary)] text-white h-9 w-full px-3 rounded-full flex shrink-0 items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm border-none cursor-pointer sm:h-10 sm:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                aria-label={`Choose ${product.name} options`}
              >
                <FaPlus size={14} />
                <span className="text-xs font-semibold">Choose</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal (Lazy Loaded) */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <Modal
            isOpen={isModalOpen}
            onClose={closeProductModal}
            className="!max-w-4xl !overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] shadow-2xl"
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2 h-56 sm:h-64 md:h-auto md:min-h-[540px] relative bg-slate-900 shrink-0 overflow-hidden">
                <img
                  src={getOptimizedImageUrl(product.image, 800)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Top Left Discount Ribbon */}
                {discount > 0 && (
                  <div className="absolute top-5 -left-9 z-10 -rotate-45 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-10 py-1 shadow-lg">
                    -{discount}% OFF
                  </div>
                )}

                {/* Top Left/Below Chef Special Badge */}
                {isChefSpecial && (
                  <div className={`absolute left-4 z-10 ${discount > 0 ? "top-14" : "top-4"}`}>
                    <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Chef's Special
                    </span>
                  </div>
                )}

                {/* Bottom Gradient Fade with Title & Description */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5 sm:p-6 pt-16 text-white">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Freshly made for you
                  </p>
                  <h2 className="!text-2xl sm:!text-3xl font-bold font-['Playfair_Display'] !text-white leading-tight">
                    {product.name}
                  </h2>
                  {product.description && (
                    <p className="mt-1.5 text-xs sm:text-sm text-white/85 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 min-w-0 p-5 pb-8 sm:p-7 flex flex-col overflow-y-auto overscroll-contain">

                {/* Toppings Section */}
                {product.ingredients?.length > 0 && (
                  <div className="mb-5">
                    <div className="mb-2.5 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="!mb-0.5 !text-base font-bold text-gray-900">
                          Make it yours
                        </h3>
                        <p className="text-xs text-gray-500">Choose any extras you like</p>
                      </div>
                      {selectedToppings.length > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-dark)]">
                          {selectedToppings.length} selected
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 pb-1">
                      {product.ingredients.map((ing) => {
                        const checked = selectedToppings.some(
                          (topping) => topping._id === ing._id
                        );
                        return (
                          <label
                            key={ing._id}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-colors cursor-pointer ${checked
                              ? "border-[var(--color-primary)] bg-red-50/50"
                              : "border-gray-100 bg-gray-50/60 hover:border-amber-300"
                              }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                checked={checked}
                                onChange={(e) => handleToppingToggle(e, ing)}
                              />
                              <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                {ing.name}
                              </span>
                            </div>

                            <span className="text-[11px] font-bold text-[var(--color-primary)] shrink-0">
                              +€{ing.price.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Item-specific Note */}
                <div className="mb-5">
                  <label
                    htmlFor={`item-note-${product._id}`}
                    className="block text-xs font-bold text-gray-800 mb-1.5"
                  >
                    Special instructions{" "}
                  </label>
                  <textarea
                    id={`item-note-${product._id}`}
                    rows={2}
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="e.g. No oregano, well done, cut in 8 slices..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/10 resize-none"
                  />
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 mt-auto border-t border-amber-100 bg-white pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-0">
                  <div className="flex items-center gap-3">
                    {/* Quantity Stepper */}
                    <div className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50/40 p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-10 w-9 items-center justify-center rounded-lg bg-white text-gray-700 shadow-xs transition-colors hover:bg-red-50 hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-bold tabular-nums text-gray-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        aria-label="Increase quantity"
                        className="flex h-10 w-9 items-center justify-center rounded-lg bg-white text-gray-700 shadow-xs transition-colors hover:bg-red-50 hover:text-[var(--color-primary)] cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <Button
                      onClick={(e) => {
                        handleAddToCart(e);
                        closeProductModal();
                      }}
                      aria-label={`Add ${quantity} ${product.name} to cart for €${modalTotalPrice.toFixed(2)}`}
                      className="h-12 flex-1 cursor-pointer flex-row justify-between gap-3 rounded-xl border-none bg-[var(--color-primary)] px-4 sm:px-5 text-white shadow-md shadow-red-200 transition-all hover:bg-[var(--color-primary-dark)]"
                    >
                      <span className="text-sm font-bold sm:text-base">Add to cart</span>
                      <span className="text-base font-bold tabular-nums sm:text-lg">
                        €{modalTotalPrice.toFixed(2)}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </Modal>
        </Suspense>
      )}
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
