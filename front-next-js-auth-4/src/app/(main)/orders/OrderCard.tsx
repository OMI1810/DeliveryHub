"use client";

import {
  IOrder,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "@/types/order.types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { OrderStatusStepper } from "@/components/ui/OrderStatusStepper";
import Link from "next/link";

interface OrderCardProps {
  order: IOrder;
  showDetails?: boolean;
}

export function OrderCard({ order, showDetails = false }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status];
  const statusLabel = ORDER_STATUS_LABELS[order.status];

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">
            #{order.idOrder.slice(-8).toUpperCase()}
          </h3>
          <p className="text-xs text-zinc-500">
            {format(new Date(order.createAt), "d MMM, HH:mm", { locale: ru })}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Status stepper */}
      <div className="mb-3">
        <OrderStatusStepper
          currentStatus={order.status}
          compact={!showDetails}
        />
      </div>

      {/* Restaurant */}
      <p className="text-xs text-zinc-300 mb-1">
        <span className="text-zinc-500">Ресторан:</span> {order.restaurant.name}
      </p>

      {/* Address */}
      <p className="text-xs text-zinc-300 mb-3">
        <span className="text-zinc-500">Адрес:</span> {order.address.address}
      </p>

      {/* Products */}
      <div className="border-t border-zinc-700 pt-3">
        {order.products.map((item) => (
          <p key={item.idOrderProduct} className="text-xs text-zinc-400">
            {item.product.name} × {item.quantity}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {order.payStatus ? (
            <span className="text-emerald-500">✓ Оплачен</span>
          ) : (
            <span className="text-orange-400">Не оплачен</span>
          )}
        </span>
        {order.weight && (
          <span className="text-xs text-zinc-500">{order.weight} кг</span>
        )}
      </div>

      {/* Details link */}
      {showDetails && (
        <Link
          href={`/orders/${order.idOrder}`}
          className="mt-3 block text-center text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Подробнее →
        </Link>
      )}
    </div>
  );
}
