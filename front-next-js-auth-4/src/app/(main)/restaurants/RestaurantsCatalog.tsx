"use client";

import { MiniLoader } from "@/components/ui/MiniLoader";
import { DASHBOARD_PAGES } from "@/config/pages/dashboard.config";
import restaurantService from "@/services/restaurant.service";
import { IPublicRestaurant } from "@/types/restaurant.types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

const formatTime = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function RestaurantsCatalog() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-restaurants"],
    queryFn: () => restaurantService.getAllPublic(),
  });

  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("Все");

  const restaurants: IPublicRestaurant[] = data?.data || [];

  const cuisines = useMemo(() => {
    const set = new Set(
      restaurants.map((r) => r.cuisine).filter(Boolean) as string[],
    );
    return ["Все", ...Array.from(set).sort()];
  }, [restaurants]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return restaurants.filter(
      (r) =>
        (cuisineFilter === "Все" || r.cuisine === cuisineFilter) &&
        r.name.toLowerCase().includes(q),
    );
  }, [restaurants, search, cuisineFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <MiniLoader width={40} height={40} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Рестораны</h1>

      {/* Фильтры */}
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <select
          value={cuisineFilter}
          onChange={(e) => setCuisineFilter(e.target.value)}
          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
        >
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        Найдено: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
          <p className="text-zinc-400 text-sm">Рестораны не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rest) => (
            <RestaurantCard key={rest.idRestaurant} restaurant={rest} />
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: IPublicRestaurant }) {
  return (
    <Link
      href={DASHBOARD_PAGES.RESTAURANT_MENU(restaurant.idRestaurant)}
      className="block bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 active:bg-zinc-800 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{restaurant.name}</h3>
          {restaurant.cuisine && (
            <p className="text-xs text-zinc-400 mt-0.5">
              🍽 {restaurant.cuisine}
            </p>
          )}
          {restaurant.address?.address && (
            <p className="text-xs text-zinc-500 mt-1 truncate">
              📍 {restaurant.address.address.address}
            </p>
          )}
        </div>
        <span className="text-xs text-zinc-500 shrink-0 whitespace-nowrap">
          {formatTime(restaurant.timeOpened)}–{formatTime(restaurant.timeClosed)}
        </span>
      </div>
    </Link>
  );
}
