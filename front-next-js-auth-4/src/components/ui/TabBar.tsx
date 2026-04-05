"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "./NavIcon";
import { useCart } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";

interface TabItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  roleRequired?: "deliveryman" | "cashier" | "owner";
}

export function TabBar() {
  const pathname = usePathname();
  const { carts } = useCart();
  const { user } = useProfile();

  const cartItemsCount = carts.reduce((sum, c) => sum + c.items.length, 0);

  const tabs: TabItem[] = [
    { href: "/restaurants", label: "Рестораны", icon: "restaurant" },
    { href: "/cart", label: "Корзина", icon: "cart", badge: cartItemsCount },
    { href: "/orders", label: "Заказы", icon: "orders" },
    { href: "/profile", label: "Профиль", icon: "profile" },
  ];

  // Добавляем табы для ролей
  if (user?.isDeliveryman) {
    tabs.push({ href: "/work", label: "Работа", icon: "work" });
  }

  if (user?.isCashier) {
    tabs.push({ href: "/cashier", label: "Касса", icon: "cashier" });
  }

  if (user?.isOwner) {
    tabs.push({ href: "/owner", label: "Владелец", icon: "owner" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname?.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                isActive
                  ? "text-emerald-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="relative">
                <NavIcon name={tab.icon} active={isActive} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
