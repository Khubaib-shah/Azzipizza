import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import Context from "@shared/context/dataContext";
import OrderModal from "../components/Modal/OrderModel";
import CartItem from "../components/CartItem";
import OrderSummaryCard from "../components/OrderSummaryCard";

function Cart() {
  const { cartItems, addToCart, removeFromCart, CartDecrement } =
    useContext(Context);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const cartTotal = cartItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  return (
    <div className="sm:container mx-auto sm:px-4 py-12 max-w-7xl relative z-10">
      <div className="flex items-center gap-4 sm:mb-10 border-b border-amber-500 pb-4">
        <div className="bg-amber-50 p-3 rounded-full">
          <ShoppingBag size={32} className="text-red-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold !text-gray-900 font-serif">
          Your Cart
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-10 sm:py-20 bg-transparent sm:bg-white sm:rounded-3xl sm:shadow-md sm:border-2 sm:border-dashed sm:border-amber-500 sm:glass">
          <div className="mx-auto w-28 h-28 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm animate-float">
            <ShoppingBag size={48} className="text-amber-500" />
          </div>
          <p className="text-2xl text-gray-900 font-serif mb-2 font-semibold">
            Your cart is currently empty
          </p>
          <p className="text-gray-500 mb-8 font-sans max-w-md mx-auto">
            Looks like you haven't made your choice yet. Browse our delicious menu and find something you love.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="px-2 grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-8 items-start">
          <div className="lg:col-span-2 sm:space-y-6 grid gap-2  grid-cols-2 sm:grid-cols-1">
            {cartItems.map((item) => (
              <CartItem
                key={`${item._id}-${JSON.stringify(
                  item.selectedIngredients.map((ing) => ing.name).sort()
                )}-${item.customizations || ""}`}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <OrderSummaryCard
              cartItems={cartItems}
              cartTotal={cartTotal}
              onCheckout={openModal}
            />
          </div>
        </div>
      )}

      <OrderModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        totalPrice={cartTotal}
        cartItems={cartItems}
      />
    </div>
  );
}

export default Cart;
