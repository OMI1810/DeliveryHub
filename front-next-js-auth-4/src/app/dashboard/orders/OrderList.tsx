"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { OrderCard } from "./OrderCard";
import { MiniLoader } from "@/components/ui/MiniLoader";

export function OrderList() {
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderService.getMyOrders(),
    refetchInterval: 30000, // Refetch every 30 seconds for status updates
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <MiniLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">Ошибка загрузки заказов</p>
        <p className="text-zinc-500 mt-2">Попробуйте обновить страницу</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400 text-lg">У вас пока нет заказов</p>
        <p className="text-zinc-600 mt-2">Оформите первый заказ в корзине</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.idOrder} order={order} />
      ))}
    </div>
  );
}
