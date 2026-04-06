"use client";

import { MiniLoader } from "@/components/ui/MiniLoader";
import { useProfile } from "@/hooks/useProfile";
import cashierService, {
  IPaginatedCashierOrders,
} from "@/services/cashier.service";
import { ICashierOrder } from "@/types/cashier.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Новый",
  COOKING: "Готовится",
  COURIER_ACCEPTED: "Принят курьером",
  FROM_DELIVERYMAN: "У курьера",
  DELIVERED: "Доставлен",
};

const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-yellow-600/20 text-yellow-400",
  COOKING: "bg-blue-600/20 text-blue-400",
  COURIER_ACCEPTED: "bg-orange-600/20 text-orange-400",
  FROM_DELIVERYMAN: "bg-purple-600/20 text-purple-400",
  DELIVERED: "bg-emerald-600/20 text-emerald-400",
};

const STATUS_FLOW: Record<
  string,
  { next: string; label: string; action?: "status" | "handover" }
> = {
  CREATED: { next: "COOKING", label: "Принять", action: "status" },
  COOKING: { next: "", label: "" },
  COURIER_ACCEPTED: {
    next: "FROM_DELIVERYMAN",
    label: "Отдать курьеру",
    action: "handover",
  },
  FROM_DELIVERYMAN: { next: "", label: "" },
  DELIVERED: { next: "", label: "" },
};

export function CashierContent() {
  const { user } = useProfile();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const hasCashierRole = user?.isCashier === true;

  const { data, isLoading } = useQuery({
    queryKey: ["cashier-orders", page, limit],
    queryFn: () => cashierService.getOrders({ page, limit }),
    refetchInterval: 10000,
    enabled: hasCashierRole,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      cashierService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Статус обновлён");
      queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    },
  });

  const handoverToCourier = useMutation({
    mutationFn: (orderId: string) => cashierService.handoverToCourier(orderId),
    onSuccess: () => {
      toast.success("Заказ передан курьеру");
      queryClient.invalidateQueries({ queryKey: ["cashier-orders"] });
    },
  });

  if (!hasCashierRole) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🧾</div>
        <h2 className="text-lg font-bold mb-2">Касса</h2>
        <p className="text-zinc-400 text-sm">
          Роль кассира недоступна. Обратитесь к администратору.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <MiniLoader />
      </div>
    );
  }

  const ordersData = data?.data;
  const isPaginated =
    ordersData && typeof ordersData === "object" && "orders" in ordersData;
  const orders: ICashierOrder[] = isPaginated
    ? (ordersData as IPaginatedCashierOrders).orders
    : (ordersData as ICashierOrder[]);
  const totalPages = isPaginated
    ? (ordersData as IPaginatedCashierOrders).totalPages
    : 1;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Касса</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-zinc-400 text-sm">Нет заказов</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.idOrder}
                order={order}
                updateStatus={updateStatus}
                handoverToCourier={handoverToCourier}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
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
        </>
      )}
    </div>
  );
}

function OrderCard({
  order,
  updateStatus,
  handoverToCourier,
}: {
  order: ICashierOrder;
  updateStatus: {
    mutate: (vars: { orderId: string; status: string }) => void;
    isPending: boolean;
  };
  handoverToCourier: {
    mutate: (orderId: string) => void;
    isPending: boolean;
  };
}) {
  const flow = STATUS_FLOW[order.status];
  const isHandover = flow?.action === "handover";

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-sm">#{order.idOrder.slice(-6)}</p>
          <p className="text-xs text-zinc-500">
            {new Date(order.createAt).toLocaleString("ru-RU")}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ""}`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {/* Info */}
      <div className="text-xs space-y-1">
        <p className="text-zinc-400">📍 {order.address?.address || "—"}</p>
        <p className="text-zinc-400">
          👤 {order.client?.surname} {order.client?.name}
          {order.client?.phone ? ` • ${order.client.phone}` : ""}
        </p>
      </div>

      {/* Products */}
      <div className="border-t border-zinc-700 pt-2 space-y-1">
        {order.products.map((p) => (
          <p key={p.idOrderProduct} className="text-xs text-zinc-300">
            {p.product.name} × {p.quantity} —{" "}
            {(p.price * p.quantity).toFixed(0)} ₽
          </p>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
        <p className="font-semibold text-sm">
          {order.products
            .reduce((s, p) => s + p.price * p.quantity, 0)
            .toFixed(0)}{" "}
          ₽
        </p>

        {flow?.next && order.status !== "DELIVERED" && (
          <button
            onClick={() =>
              isHandover
                ? handoverToCourier.mutate(order.idOrder)
                : updateStatus.mutate({
                    orderId: order.idOrder,
                    status: flow.next,
                  })
            }
            disabled={
              isHandover ? handoverToCourier.isPending : updateStatus.isPending
            }
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium active:bg-emerald-700 disabled:opacity-50"
          >
            {flow.label}
          </button>
        )}
      </div>
    </div>
  );
}
