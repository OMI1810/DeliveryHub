"use client";

import { useCart } from "@/hooks/useCart";
import { RestaurantCart } from "./RestaurantCart";

export function CartPage() {
  const { carts, clearAll } = useCart();

  const nonEmptyCarts = carts.filter((c) => c.items.length > 0);

  if (nonEmptyCarts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🛒</div>
        <p className="text-zinc-400 text-sm">Корзина пуста</p>
        <p className="text-zinc-600 text-xs mt-1">
          Добавьте товары из ресторана
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Корзина</h1>
        <button
          onClick={clearAll}
          className="text-rose-500 text-xs font-medium"
        >
          Очистить всё
        </button>
      </div>

      {nonEmptyCarts.map((cart) => (
        <RestaurantCart
          key={cart.restaurantId}
          restaurantId={cart.restaurantId}
        />
      ))}
    </div>
  );
}
