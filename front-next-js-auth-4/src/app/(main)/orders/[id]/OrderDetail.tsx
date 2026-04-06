"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { OrderStatusStepper } from "@/components/ui/OrderStatusStepper";
import { MiniLoader } from "@/components/ui/MiniLoader";
import { ORDER_STATUS_LABELS } from "@/types/order.types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

export function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <MiniLoader />
      </div>
    );
  }

  if (error || !order) {
    return notFound();
  }

  const total = order.products.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/orders"
        className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        ← Назад к заказам
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            #{order.idOrder.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-zinc-500">
            {format(new Date(order.createAt), "d MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            order.status === "DELIVERED"
              ? "bg-emerald-500/20 text-emerald-400"
              : order.status === "CREATED"
                ? "bg-blue-500/20 text-blue-400"
                : order.status === "COOKING"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : order.status === "COURIER_ACCEPTED"
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-purple-500/20 text-purple-400"
          }`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Status stepper */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <OrderStatusStepper currentStatus={order.status} />
      </div>

      {/* Restaurant */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-2">🍽️ Ресторан</h2>
        <p className="text-sm text-zinc-300">{order.restaurant.name}</p>
        {order.restaurant.cuisine && (
          <p className="text-xs text-zinc-500 mt-1">
            Кухня: {order.restaurant.cuisine}
          </p>
        )}
      </div>

      {/* Delivery address */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-2">📍 Адрес доставки</h2>
        <p className="text-sm text-zinc-300">{order.address.address}</p>
        {(order.address.flat ||
          order.address.floor ||
          order.address.entrance) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {order.address.flat && (
              <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                Кв. {order.address.flat}
              </span>
            )}
            {order.address.floor && (
              <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                Этаж {order.address.floor}
              </span>
            )}
            {order.address.entrance && (
              <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                Подъезд {order.address.entrance}
              </span>
            )}
          </div>
        )}
        {order.address.doorphone && (
          <p className="text-xs text-zinc-500 mt-2">
            Домофон: {order.address.doorphone}
          </p>
        )}
        {order.address.comment && (
          <p className="text-xs text-zinc-500 mt-1">
            Комментарий: {order.address.comment}
          </p>
        )}
      </div>

      {/* Products */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">🛒 Состав заказа</h2>
        <div className="space-y-2">
          {order.products.map((item) => (
            <div
              key={item.idOrderProduct}
              className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
            >
              <div>
                <p className="text-sm text-zinc-200">{item.product.name}</p>
                <p className="text-xs text-zinc-500">
                  {item.product.description?.slice(0, 60)}
                  {item.product.description &&
                    item.product.description.length > 60 &&
                    "..."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-200">
                  {item.product.price * item.quantity} ₽
                </p>
                <p className="text-xs text-zinc-500">× {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-3 border-t border-zinc-700 flex items-center justify-between">
          <span className="text-sm text-zinc-400">Итого:</span>
          <span className="text-lg font-bold text-emerald-400">
            {total.toFixed(0)} ₽
          </span>
        </div>
      </div>

      {/* Payment status */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-2">💳 Оплата</h2>
        <div className="flex items-center gap-2">
          {order.payStatus ? (
            <>
              <span className="text-emerald-500 text-lg">✓</span>
              <span className="text-sm text-emerald-400">Оплачен</span>
            </>
          ) : (
            <>
              <span className="text-orange-400 text-lg">⏳</span>
              <span className="text-sm text-orange-400">Не оплачен</span>
            </>
          )}
        </div>
      </div>

      {/* Weight */}
      {order.weight && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-2">⚖️ Вес заказа</h2>
          <p className="text-sm text-zinc-300">{order.weight} кг</p>
        </div>
      )}
    </div>
  );
}
