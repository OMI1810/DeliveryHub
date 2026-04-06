"use client";

import cartService from "@/services/cart.service";
import { DASHBOARD_PAGES } from "@/config/pages/dashboard.config";
import Link from "next/link";
import { useState, useEffect } from "react";

const cartEventTarget = new EventTarget();

export function notifyCartChange() {
  cartEventTarget.dispatchEvent(new Event("cart-change"));
}

export function subscribeToCartChanges(fn: () => void) {
  const handler = () => fn();
  cartEventTarget.addEventListener("cart-change", handler);
  return () => cartEventTarget.removeEventListener("cart-change", handler);
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
      className="relative p-2 active:bg-zinc-800 rounded-full"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
          suppressHydrationWarning
        >
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
