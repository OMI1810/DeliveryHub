"use client";

import {
  IOrder,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/types/order.types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface OrderCardProps {
  order: IOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status];
  const statusLabel = ORDER_STATUS_LABELS[order.status];

  const totalItems = order.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Заказ #{order.idOrder.slice(-8).toUpperCase()}
          </h3>
          <p className="text-sm text-zinc-400">
            {format(new Date(order.createAt), "d MMMM yyyy, HH:mm", {
              locale: ru,
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Restaurant */}
      <div className="mb-4">
        <p className="text-sm text-zinc-300">
          <span className="font-medium text-zinc-200">Ресторан:</span>{" "}
          {order.restaraunt.name}
        </p>
        {order.restaraunt.cuisine && (
          <p className="text-sm text-zinc-500">
            Кухня: {order.restaraunt.cuisine}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="mb-4">
        <p className="text-sm text-zinc-300">
          <span className="font-medium text-zinc-200">Адрес доставки:</span>{" "}
          {order.address.address}
        </p>
        {order.address.flat && (
          <p className="text-sm text-zinc-500">
            Кв. {order.address.flat}
            {order.address.entrance && `, Подъезд ${order.address.entrance}`}
            {order.address.floor && `, Этаж ${order.address.floor}`}
          </p>
        )}
      </div>

      {/* Products */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-sm font-medium text-zinc-300 mb-2">
          Товары ({totalItems} шт.):
        </p>
        <ul className="space-y-1">
          {order.products.map((item) => (
            <li
              key={item.idOrderProduct}
              className="text-sm text-zinc-400 flex justify-between"
            >
              <span>
                {item.product.name} × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">Оплата:</span>{" "}
            {order.payStatus ? (
              <span className="text-emerald-500">Оплачен</span>
            ) : (
              <span className="text-orange-400">Не оплачен</span>
            )}
          </span>
          {order.weight && (
            <span className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">Вес:</span>{" "}
              {order.weight} кг
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
