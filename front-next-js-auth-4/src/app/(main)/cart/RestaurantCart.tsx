"use client";

import cartService from "@/services/cart.service";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/types/cart.types";
import { useState } from "react";
import { CheckoutForm } from "./CheckoutForm";

interface Props {
  restaurantId: string;
}

export function RestaurantCart({ restaurantId }: Props) {
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const cart = cartService.getCartByRestaurant(restaurantId);
  if (!cart || cart.items.length === 0) return null;

  const total = cartService.getCartTotal(restaurantId);

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{cart.restaurantName}</h3>
        <button
          onClick={() => clearCart(restaurantId)}
          className="text-rose-500 text-xs"
        >
          Очистить
        </button>
      </div>

      <div className="space-y-3">
        {cart.items.map((item: CartItem) => (
          <div
            key={item.productId}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.price.toFixed(0)} ₽</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-zinc-700 rounded-lg">
                <button
                  onClick={() =>
                    updateQuantity(
                      restaurantId,
                      item.productId,
                      item.quantity - 1,
                    )
                  }
                  className="px-3 py-1.5 text-sm active:bg-zinc-600 rounded-l-lg"
                >
                  −
                </button>
                <span className="px-2 py-1.5 text-sm min-w-[32px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(
                      restaurantId,
                      item.productId,
                      item.quantity + 1,
                    )
                  }
                  className="px-3 py-1.5 text-sm active:bg-zinc-600 rounded-r-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(restaurantId, item.productId)}
                className="text-zinc-500 active:text-rose-500 text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
        <p className="font-bold">Итого: {total} ₽</p>
        <button
          onClick={() => setShowCheckout(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium active:bg-emerald-700"
        >
          Оформить
        </button>
      </div>

      {showCheckout && (
        <CheckoutForm
          restaurantId={cart.restaurantId}
          restaurantName={cart.restaurantName}
          items={cart.items}
          total={total}
          onSuccess={() => {
            clearCart(restaurantId);
            setShowCheckout(false);
          }}
          onCancel={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
