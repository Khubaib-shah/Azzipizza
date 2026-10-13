import { FaPlus, FaStar } from "react-icons/fa";
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

  const discount = normalizeDiscountPercent(product.discount);
  const basePrice = Number(product.price);
  const discountedPrice = useMemo(
    () => calculateDiscountedPrice(basePrice, discount),
    [basePrice, discount],
  );

  const rating = useMemo(() => product.rating || 4.5, [product.rating]);
  const reviews = useMemo(
    () =>
      product.reviews ||
      (product._id ? (parseInt(product._id.slice(-2), 16) % 30) + 120 : 150),
    [product.reviews, product._id],
  );

  const finalPrice = useMemo(
    () => calculateUnitPrice(discountedPrice, selectedToppings),
    [discountedPrice, selectedToppings],
  );
  const extrasPrice = useMemo(
    () => calculateUnitPrice(0, selectedToppings),
    [selectedToppings],
  );
  const offerSavings = Math.max(0, basePrice - discountedPrice);

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
    addToCart(cartItem, selectedToppings);
    toast.success(`${product.name} added to cart`);
    setSelectedToppings([]);
  };
  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedToppings([]);
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
              <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto md:min-h-[560px] relative bg-amber-50">
                <img
                  src={getOptimizedImageUrl(product.image, 800)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isChefSpecial && (
                    <span className="bg-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                      Chef's Special
                    </span>
                  )}
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 min-w-0 p-5 sm:p-7 md:p-8 flex flex-col overflow-y-auto overscroll-contain">
                <div className="mb-5 border-b border-amber-100 pb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-dark)]">
                    Freshly made for you
                  </p>
                  <h2 className="!text-2xl sm:!text-3xl font-bold font-['Playfair_Display'] text-gray-900 mb-2 pr-9">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex text-amber-400">
                      <FaStar />
                    </div>
                    <span>
                      {rating} ({reviews} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-5 leading-relaxed text-sm">
                  {product.description}
                </p>

                {/* Toppings Section */}
                {product.ingredients?.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="!mb-1 !text-base font-bold text-gray-900">
                          Make it yours
                        </h3>
                        <p className="text-xs text-gray-500">Choose any extras you like</p>
                      </div>
                      {selectedToppings.length > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[var(--color-accent-dark)]">
                          {selectedToppings.length} selected
                        </span>
                      )}
                    </div>
                    <motion.div
                      className="space-y-2 pb-1"
                      variants={container}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                    >
                      {product.ingredients.map((ing) => (
                        <motion.label
                          key={ing._id}
                          variants={item}
                          className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-colors cursor-pointer ${
                            selectedToppings.some((topping) => topping._id === ing._id)
                              ? "border-[var(--color-primary)] bg-red-50/50"
                              : "border-gray-100 bg-gray-50/50 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                              checked={selectedToppings.some(
                                (t) => t._id === ing._id,
                              )}
                              onChange={(e) => handleToppingToggle(e, ing)}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {ing.name}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-[var(--color-primary)]">
                            +€{ing.price.toFixed(2)} each
                          </span>
                        </motion.label>
                      ))}
                    </motion.div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="sticky bottom-0 mt-auto border-t border-amber-100 bg-white pt-4">
                  <div className="mb-3 space-y-2 rounded-xl bg-amber-50/70 px-3 py-3 text-xs sm:px-4">
                    <div className="flex justify-between gap-3 text-[var(--color-text-light)]">
                      <span>Pizza price</span>
                      <span className="font-medium text-[var(--color-text)]">
                        {discount > 0 && (
                          <span className="mr-2 text-[var(--color-text-lighter)] line-through">
                            €{basePrice.toFixed(2)}
                          </span>
                        )}
                        €{discountedPrice.toFixed(2)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between gap-3 text-[var(--color-basil)]">
                        <span>Offer · {discount}% off</span>
                        <span className="font-semibold">−€{offerSavings.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedToppings.length > 0 && (
                      <div className="flex justify-between gap-3 text-[var(--color-text-light)]">
                        <span>Extras · {selectedToppings.length} selected</span>
                        <span className="font-medium text-[var(--color-text)]">
                          +€{extrasPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-3 border-t border-amber-200 pt-2 font-semibold text-[var(--color-text)]">
                      <span>Price per pizza</span>
                      <span className="text-[var(--color-primary)]">€{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      handleAddToCart(e);
                      closeProductModal();
                    }}
                    aria-label={`Add ${product.name} to cart for €${finalPrice.toFixed(2)} per pizza`}
                    className="h-auto min-h-16 w-full cursor-pointer flex-row justify-between gap-3 whitespace-normal rounded-xl border-none bg-[var(--color-primary)] px-5 py-4 text-left leading-tight text-white shadow-md shadow-red-200 transition-all hover:bg-[var(--color-primary-dark)]"
                  >
                    <span className="min-w-0 text-sm font-bold sm:text-base">Add to cart</span>
                    <span className="shrink-0 text-right">
                      <span className="block text-base font-bold tabular-nums sm:text-lg">€{finalPrice.toFixed(2)}</span>
                      {selectedToppings.length > 0 && (
                        <span className="mt-0.5 block text-[10px] font-medium leading-tight text-white/80 sm:text-xs">
                          per pizza · extras included
                        </span>
                      )}
                    </span>
                  </Button>
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
