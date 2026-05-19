import { createContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { baseUri } from "@shared/config/api";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);

  // Sync ref to avoid stale closures in stable callbacks
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    // Only show loading if we don't have items yet to prevent flickering
    if (itemsRef.current.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const { data } = await baseUri.get("/api/menu");
      setItems(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
      setError(error.message || "Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item, selectedIngredients = [], customizations = "") => {
    setCartItems((prevCart) => {
      const ingredientsKey = JSON.stringify(
        [...selectedIngredients].sort((a, b) => a.name.localeCompare(b.name))
      );

      const existingItemIndex = prevCart.findIndex((cartItem) => {
        const existingIngredientsKey = JSON.stringify(
          [...cartItem.selectedIngredients].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
        return (
          cartItem._id === item._id &&
          existingIngredientsKey === ingredientsKey &&
          cartItem.customizations === customizations
        );
      });

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            ...item,
            quantity: 1,
            selectedIngredients,
            customizations,
          },
        ];
      }
    });
  }, []);

  const CartDecrement = useCallback((item) => {
    setCartItems((prevCart) => {
      const targetIngredientsKey = JSON.stringify(
        [...item.selectedIngredients].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      return prevCart
        .map((cartItem) => {
          const currentIngredientsKey = JSON.stringify(
            [...cartItem.selectedIngredients].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );

          if (
            cartItem._id === item._id &&
            currentIngredientsKey === targetIngredientsKey &&
            cartItem.customizations === item.customizations
          ) {
            return {
              ...cartItem,
              quantity: cartItem.quantity - 1,
            };
          }
          return cartItem;
        })
        .filter((cartItem) => cartItem.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prevCart) => prevCart.filter((item) => item._id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  }, []);

  const prepareOrderData = useCallback((customerInfo) => {
    return {
      ...customerInfo,
      items: cartItems.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,

        selectedIngredients: item.selectedIngredients.reduce((acc, ing) => {
          const existing = acc.find((i) => i.name === ing.name);
          if (existing) {
            existing.quantity++;
          } else {
            acc.push({ ...ing, quantity: 1 });
          }
          return acc;
        }, []),
        customizations: item.customizations || "",
      })),
      paymentStatus: "Pending",
      orderStatus: "Preparing",
    };
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const discountedPrice =
        item.price - (item.discount ? (item.price * item.discount) / 100 : 0);

      const ingredientsTotal =
        item.selectedIngredients?.reduce((sum, ing) => sum + ing.price, 0) || 0;

      return total + (discountedPrice + ingredientsTotal) * item.quantity;
    }, 0);
  }, [cartItems]);

  const refreshMenu = useCallback(async () => {
    await fetchMenu();
  }, [fetchMenu]);

  const contextValue = useMemo(
    () => ({
      items,
      cartItems,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      CartDecrement,
      clearCart,
      cartTotal,
      prepareOrderData,
      refreshMenu,
    }),
    [
      items,
      cartItems,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      CartDecrement,
      clearCart,
      cartTotal,
      prepareOrderData,
      refreshMenu,
    ]
  );

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default Context;
