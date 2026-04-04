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
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{cart.restaurantName}</h3>
        <button
          onClick={() => clearCart(restaurantId)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Очистить
        </button>
      </div>

      <div className="space-y-3">
        {cart.items.map((item: CartItem) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.price} ₽</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded">
                <button
                  onClick={() =>
                    updateQuantity(
                      restaurantId,
                      item.productId,
                      item.quantity - 1,
                    )
                  }
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-3 py-1 min-w-[40px] text-center">
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
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <p className="font-medium min-w-[80px] text-right">
                {item.price * item.quantity} ₽
              </p>

              <button
                onClick={() => removeFromCart(restaurantId, item.productId)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-lg font-bold">Итого: {total} ₽</p>
        <button
          onClick={() => setShowCheckout(true)}
          className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90"
        >
          Оформить заказ
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
