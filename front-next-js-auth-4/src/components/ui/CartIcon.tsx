"use client";
import cartService from "@/services/cart.service";
import { DASHBOARD_PAGES } from "@/config/pages/dashboard.config";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { useState, useEffect } from "react";

const listeners = new Set<() => void>();

export function notifyCartChange() {
  listeners.forEach((fn) => fn());
}

export function subscribeToCartChanges(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function CartIcon() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeToCartChanges(() => setTick((t) => t + 1));
  }, []);

  const totalItems = cartService.getTotalItems();

  return (
    <Link
      href={DASHBOARD_PAGES.CART}
      className="relative p-2 hover:bg-gray-100 rounded-full"
    >
      <FiShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          suppressHydrationWarning
        >
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
