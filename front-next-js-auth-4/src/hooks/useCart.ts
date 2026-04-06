import cartService from "@/services/cart.service";
import { Cart, CartItem } from "@/types/cart.types";
import { useSyncExternalStore, useCallback, useRef } from "react";
import {
  notifyCartChange,
  subscribeToCartChanges,
} from "@/components/ui/CartIcon";

function getCartSnapshot(): string {
  const carts = cartService.getCarts();
  const totalItems = carts.reduce(
    (sum, cart) => sum + cart.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );
  return JSON.stringify({ carts, totalItems });
}

export function useCart() {
  const snapshot = useSyncExternalStore(
    subscribeToCartChanges,
    getCartSnapshot,
    getCartSnapshot,
  );

  const parsedRef = useRef<{ carts: Cart[]; totalItems: number } | null>(null);
  const parsed = JSON.parse(snapshot) as { carts: Cart[]; totalItems: number };

  if (!parsedRef.current || JSON.stringify(parsedRef.current) !== snapshot) {
    parsedRef.current = parsed;
  }

  const { carts, totalItems } = parsedRef.current!;

  const addToCart = useCallback(
    (
      item: Omit<CartItem, "quantity">,
      restaurantId: string,
      restaurantName: string,
      quantity = 1,
    ) => {
      cartService.addToCart(item, restaurantId, restaurantName, quantity);
      notifyCartChange();
    },
    [],
  );

  const updateQuantity = useCallback(
    (restaurantId: string, productId: string, quantity: number) => {
      cartService.updateQuantity(restaurantId, productId, quantity);
      notifyCartChange();
    },
    [],
  );

  const removeFromCart = useCallback(
    (restaurantId: string, productId: string) => {
      cartService.removeFromCart(restaurantId, productId);
      notifyCartChange();
    },
    [],
  );

  const clearCart = useCallback((restaurantId: string) => {
    cartService.clearCart(restaurantId);
    notifyCartChange();
  }, []);

  const clearAll = useCallback(() => {
    cartService.clearAll();
    notifyCartChange();
  }, []);

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
