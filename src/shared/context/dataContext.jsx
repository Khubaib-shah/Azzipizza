import { createContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { baseUri } from "@shared/config/api";
import {
  calculateCartPricing,
  calculateDiscountedPrice,
  calculateUnitPrice,
  normalizeDiscountPercent,
} from "@shared/utils/pricing";

const Context = createContext();

const getIngredientsKey = (ingredients = []) =>
  JSON.stringify([...ingredients].sort((a, b) => a.name.localeCompare(b.name)));

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
      setCartItems((prevCart) =>
        prevCart.map((cartItem) => {
          const product = data.find(
            (menuItem) => String(menuItem._id) === String(cartItem._id),
          );
          if (!product) return cartItem;

          const selectedIngredients = (cartItem.selectedIngredients || []).map(
            (selectedIngredient) => {
              const currentIngredient = (product.ingredients || []).find(
                (ingredient) =>
                  (selectedIngredient._id &&
                    String(ingredient._id) === String(selectedIngredient._id)) ||
                  ingredient.name === selectedIngredient.name,
              );
              return currentIngredient
                ? { ...selectedIngredient, price: Number(currentIngredient.price) }
                : selectedIngredient;
            },
          );
          const discount = normalizeDiscountPercent(product.discount);
          const originalPrice = Number(product.price);
          const price = calculateUnitPrice(
            calculateDiscountedPrice(originalPrice, discount),
            selectedIngredients,
          );

          return {
            ...cartItem,
            discount,
            originalPrice,
            price,
            selectedIngredients,
          };
        }),
      );
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
      const selectedIngredientsKey = getIngredientsKey(selectedIngredients);

      const existingItemIndex = prevCart.findIndex((cartItem) => {
        const existingIngredientsKey = getIngredientsKey(cartItem.selectedIngredients);
        return (
          cartItem._id === item._id &&
          existingIngredientsKey === selectedIngredientsKey &&
          cartItem.customizations === (customizations || "")
        );
      });

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          ...item,
          quantity: updatedCart[existingItemIndex].quantity + 1,
          selectedIngredients,
          customizations,
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
      const targetIngredientsKey = getIngredientsKey(item.selectedIngredients);

      return prevCart
        .map((cartItem) => {
          const currentIngredientsKey = getIngredientsKey(cartItem.selectedIngredients);

          if (
            cartItem._id === item._id &&
            currentIngredientsKey === targetIngredientsKey &&
            cartItem.customizations === (item.customizations || "")
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

  const removeFromCart = useCallback((item) => {
    const targetIngredientsKey = getIngredientsKey(item.selectedIngredients);
    const targetCustomizations = item.customizations || "";

    setCartItems((prevCart) =>
      prevCart.filter(
        (cartItem) =>
          cartItem._id !== item._id ||
          getIngredientsKey(cartItem.selectedIngredients) !== targetIngredientsKey ||
          (cartItem.customizations || "") !== targetCustomizations
      )
    );
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
    return calculateCartPricing(cartItems).total;
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
