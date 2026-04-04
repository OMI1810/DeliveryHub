import cartService from "@/services/cart.service";
import { Cart, CartItem } from "@/types/cart.types";
import { useState, useCallback } from "react";
import { notifyCartChange } from "@/components/ui/CartIcon";

export function useCart() {
  const [, rerender] = useState({});

  const forceRerender = useCallback(() => {
    rerender({});
    notifyCartChange();
  }, []);

  // Читаем напрямую при каждом рендере
  const carts = cartService.getCarts();
  const totalItems = carts.reduce(
    (sum, cart) => sum + cart.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  const addToCart = useCallback(
    (
      item: Omit<CartItem, "quantity">,
      restaurantId: string,
      restaurantName: string,
      quantity = 1,
    ) => {
      cartService.addToCart(item, restaurantId, restaurantName, quantity);
      forceRerender();
    },
    [forceRerender],
  );

  const updateQuantity = useCallback(
    (restaurantId: string, productId: string, quantity: number) => {
      cartService.updateQuantity(restaurantId, productId, quantity);
      forceRerender();
    },
    [forceRerender],
  );

  const removeFromCart = useCallback(
    (restaurantId: string, productId: string) => {
      cartService.removeFromCart(restaurantId, productId);
      forceRerender();
    },
    [forceRerender],
  );

  const clearCart = useCallback(
    (restaurantId: string) => {
      cartService.clearCart(restaurantId);
      forceRerender();
    },
    [forceRerender],
  );

  const clearAll = useCallback(() => {
    cartService.clearAll();
    forceRerender();
  }, [forceRerender]);

  const getCartTotal = useCallback((restaurantId: string) => {
    return cartService.getCartTotal(restaurantId);
  }, []);

  return {
    carts,
    totalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearAll,
    getCartTotal,
  };
}
