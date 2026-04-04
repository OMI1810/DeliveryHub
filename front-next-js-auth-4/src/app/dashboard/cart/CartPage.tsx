"use client";
import { useCart } from "@/hooks/useCart";
import { RestaurantCart } from "./RestaurantCart";

export function CartPage() {
  const { carts, clearAll } = useCart();

  const nonEmptyCarts = carts.filter((c) => c.items.length > 0);

  if (nonEmptyCarts.length === 0) {
    return (
      <div className="mt-4 text-center py-12">
        <p className="text-2xl text-gray-400">Корзина пуста</p>
        <p className="text-gray-500 mt-2">Добавьте товары из ресторана</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Корзина</h2>
        <button
          onClick={clearAll}
          className="text-red-600 hover:text-red-800 text-sm"
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
