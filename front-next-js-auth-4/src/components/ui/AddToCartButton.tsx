"use client";

import { useCart } from "@/hooks/useCart";
import { useState } from "react";

interface Props {
  productId: string;
  productName: string;
  productPrice: number;
  restaurantId: string;
  restaurantName: string;
}

export function AddToCartButton({
  productId,
  productName,
  productPrice,
  restaurantId,
  restaurantName,
}: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(
      { productId, name: productName, price: productPrice },
      restaurantId,
      restaurantName,
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-emerald-600 text-white active:bg-emerald-700"
      }`}
    >
      {added ? "✓" : "+"}
      {added ? "Добавлено" : "В корзину"}
    </button>
  );
}
