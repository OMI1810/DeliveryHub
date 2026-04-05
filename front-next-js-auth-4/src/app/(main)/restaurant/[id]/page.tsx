"use client";

import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { MiniLoader } from "@/components/ui/MiniLoader";
import restaurantService from "@/services/restaurant.service";
import { IProduct } from "@/types/product.types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const restaurantId = id as string;

  const { data: restData, isLoading: restLoading } = useQuery({
    queryKey: ["public-restaurant", restaurantId],
    queryFn: () => restaurantService.getPublicById(restaurantId),
    enabled: !!restaurantId,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["restaurant-products", restaurantId],
    queryFn: () => restaurantService.getRestaurantProducts(restaurantId),
    enabled: !!restaurantId,
  });

  const isLoading = restLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <MiniLoader width={40} height={40} />
      </div>
    );
  }

  const restaurant = restData?.data;
  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-sm">Ресторан не найден</p>
        <Link
          href="/restaurants"
          className="text-emerald-500 text-sm mt-2 inline-block"
        >
          ← К ресторанам
        </Link>
      </div>
    );
  }

  const products: IProduct[] = productsData?.data || [];

  return (
    <div className="pb-4">
      <Link
        href="/restaurants"
        className="inline-block text-zinc-400 text-sm mb-4"
      >
        ← К ресторанам
      </Link>

      {/* Restaurant header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">{restaurant.name}</h1>
        {restaurant.cuisine && (
          <p className="text-sm text-zinc-400 mt-0.5">🍽 {restaurant.cuisine}</p>
        )}
        {restaurant.description && (
          <p className="text-sm text-zinc-500 mt-1">{restaurant.description}</p>
        )}
        {restaurant.address?.address && (
          <p className="text-xs text-zinc-500 mt-1">
            📍 {restaurant.address.address.address}
          </p>
        )}
      </div>

      {/* Menu */}
      <h2 className="text-lg font-semibold mb-3">Меню</h2>

      {products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
          <p className="text-zinc-400 text-sm">Меню пока пуст</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.idProduct}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4"
            >
              <h3 className="font-semibold text-sm">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold">
                    {product.price.toFixed(0)} ₽
                  </span>
                  {product.timeCooking && (
                    <span className="text-xs text-zinc-500">
                      ⏱ {product.timeCooking} мин
                    </span>
                  )}
                </div>
                <AddToCartButton
                  productId={product.idProduct}
                  productName={product.name}
                  productPrice={product.price}
                  restaurantId={restaurant.idRestaurant}
                  restaurantName={restaurant.name}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
