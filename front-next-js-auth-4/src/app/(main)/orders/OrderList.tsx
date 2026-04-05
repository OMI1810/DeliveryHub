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
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <MiniLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400 text-sm">Ошибка загрузки заказов</p>
        <p className="text-zinc-600 text-xs mt-1">Попробуйте обновить</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-zinc-400 text-sm">Заказов пока нет</p>
        <p className="text-zinc-600 text-xs mt-1">Оформите первый заказ</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.idOrder} order={order} />
      ))}
    </div>
  );
}
