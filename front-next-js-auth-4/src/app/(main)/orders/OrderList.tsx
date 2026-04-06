"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { OrderCard } from "./OrderCard";
import { MiniLoader } from "@/components/ui/MiniLoader";
import { useState } from "react";

export function OrderList() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders", page, limit],
    queryFn: () => orderService.getMyOrders({ page, limit }),
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

  const orders = ordersData?.orders ?? [];
  const totalPages = ordersData?.totalPages ?? 1;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-zinc-400 text-sm">Заказов пока нет</p>
        <p className="text-zinc-600 text-xs mt-1">Оформите первый заказ</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.idOrder} order={order} showDetails />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
          >
            Назад
          </button>
          <span className="text-sm text-zinc-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}
