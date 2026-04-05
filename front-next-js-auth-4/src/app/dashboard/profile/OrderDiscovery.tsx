"use client";

import dynamic from "next/dynamic";
import orderDiscoveryService from "@/services/order-discovery.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";

const CourierMap = dynamic(
  () =>
    import("@/components/ui/address/CourierMap").then((mod) => mod.CourierMap),
  {
    ssr: false,
    loading: () => <div className="w-full h-[250px] bg-zinc-800 rounded-lg" />,
  },
);

export function OrderDiscovery() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: activeOrderData,
    isLoading: isLoadingActiveOrder,
    isFetching: isFetchingActiveOrder,
    refetch: refetchActiveOrder,
  } = useQuery({
    queryKey: ["active-order"],
    queryFn: () => orderDiscoveryService.fetchActiveOrder(),
    refetchOnReconnect: true,
    refetchInterval: 5000, // Автообновление каждые 5 сек
  });

  const activeOrder = activeOrderData?.data ?? null;

  const {
    data,
    isLoading: isLoadingDiscovery,
    isFetching: isFetchingDiscovery,
    refetch: refetchDiscovery,
  } = useQuery({
    queryKey: ["order-discovery"],
    queryFn: () => orderDiscoveryService.fetchOrders(),
    enabled: !activeOrder,
    refetchOnReconnect: true,
    refetchInterval: 10000, // Автообновление каждые 10 сек
  });

  const { mutate: acceptOrder, isPending: isAcceptPending } = useMutation({
    mutationKey: ["accept-order"],
    mutationFn: (orderId: string) => orderDiscoveryService.acceptOrder(orderId),
    onSuccess() {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      queryClient.invalidateQueries({ queryKey: ["order-discovery"] });
    },
    onError(error: AxiosError<{ message?: string | string[] }>) {
      const message = error.response?.data?.message;
      setErrorMessage(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Не удалось принять заказ",
      );
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      queryClient.invalidateQueries({ queryKey: ["order-discovery"] });
    },
  });

  const { mutate: completeOrder, isPending: isCompletePending } = useMutation({
    mutationKey: ["complete-order"],
    mutationFn: (orderId: string) =>
      orderDiscoveryService.completeOrder(orderId),
    onSuccess() {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      queryClient.invalidateQueries({ queryKey: ["order-discovery"] });
    },
    onError(error: AxiosError<{ message?: string | string[] }>) {
      const message = error.response?.data?.message;
      setErrorMessage(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Не удалось завершить заказ",
      );
    },
  });

  const uniqueOrders = useMemo(
    () =>
      Array.from(
        new Map(
          (data?.data ?? []).map((order) => [order.idOrder, order]),
        ).values(),
      ),
    [data?.data],
  );

  const isLoading = isLoadingActiveOrder || isLoadingDiscovery;
  const isRefreshing = isFetchingActiveOrder || isFetchingDiscovery;

  // Debug: log activeOrder changes
  useEffect(() => {
    if (activeOrder) {
      console.log("[OrderDiscovery] activeOrder:", {
        id: activeOrder.idOrder,
        status: activeOrder.status,
        restaurantAddress: activeOrder.restaurantAddress,
        restaurantCoordinates: activeOrder.restaurantCoordinates,
        customerAddress: activeOrder.customerAddress,
        customerCoordinates: activeOrder.customerCoordinates,
      });
    }
  }, [activeOrder]);

  return (
    <div className="mt-8 w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">Доставка заказов</h3>
        <button
          type="button"
          onClick={() => {
            refetchActiveOrder();
            if (!activeOrder) {
              refetchDiscovery();
            }
          }}
          disabled={isRefreshing}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-primary disabled:opacity-60"
        >
          {isRefreshing ? "Обновление..." : "Обновить"}
        </button>
      </div>
      {errorMessage && (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage}
        </p>
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : activeOrder ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3">
          <p>
            <span className="font-semibold">Номер заказа:</span>{" "}
            {activeOrder.orderNumber}
          </p>
          <p>
            <span className="font-semibold">Клиент:</span>{" "}
            {activeOrder.customerName}
          </p>

          {/* Карта: ресторан при COURIER_ACCEPTED, клиент при FROM_DELIVERYMAN */}
          {activeOrder.status === "COURIER_ACCEPTED" &&
            activeOrder.restaurantCoordinates &&
            activeOrder.restaurantCoordinates.lat !== 0 &&
            activeOrder.restaurantCoordinates.lon !== 0 && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">
                  📍 Забрать: {activeOrder.restaurantAddress}
                </p>
                <CourierMap
                  key={`restaurant-${activeOrder.idOrder}`}
                  center={[
                    activeOrder.restaurantCoordinates.lat,
                    activeOrder.restaurantCoordinates.lon,
                  ]}
                  label={activeOrder.restaurantAddress}
                />
              </div>
            )}

          {activeOrder.status === "COURIER_ACCEPTED" &&
            (!activeOrder.restaurantCoordinates ||
              activeOrder.restaurantCoordinates.lat === 0 ||
              activeOrder.restaurantCoordinates.lon === 0) && (
              <p className="text-sm text-zinc-400">
                📍 Забрать: {activeOrder.restaurantAddress} (координаты не
                указаны)
              </p>
            )}

          {activeOrder.status === "FROM_DELIVERYMAN" &&
            activeOrder.customerCoordinates && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">
                  📍 Доставить: {activeOrder.customerAddress}
                </p>
                <CourierMap
                  key={`customer-${activeOrder.idOrder}`}
                  center={[
                    activeOrder.customerCoordinates.lat,
                    activeOrder.customerCoordinates.lon,
                  ]}
                  label={activeOrder.customerAddress}
                />
              </div>
            )}

          <p>
            <span className="font-semibold">Комментарии:</span>{" "}
            {activeOrder.comments || "Нет комментариев"}
          </p>
          <p className="font-semibold">Позиции:</p>
          <ul className="list-disc pl-6">
            {activeOrder.items.map((item) => (
              <li key={item.idProduct}>
                {item.name}
                {item.description ? ` - ${item.description}` : ""}
              </li>
            ))}
          </ul>
          {activeOrder.status === "FROM_DELIVERYMAN" && (
            <button
              type="button"
              onClick={() => completeOrder(activeOrder.idOrder)}
              disabled={isCompletePending}
              className="mt-3 rounded-lg px-4 py-2 font-semibold text-white bg-primary disabled:opacity-60"
            >
              {isCompletePending ? "Обработка..." : "Завершить заказ"}
            </button>
          )}
        </div>
      ) : uniqueOrders.length === 0 ? (
        <p>Нет доступных заказов</p>
      ) : (
        <div className="space-y-3">
          {uniqueOrders.map((order) => (
            <div
              key={order.idOrder}
              className="rounded-lg border border-zinc-700/60 p-4"
            >
              <p>
                <span className="font-semibold">Адрес получения:</span>{" "}
                {order.pickupAddress || "Не указан"}
              </p>
              <p>
                <span className="font-semibold">Вес заказа:</span>{" "}
                {order.weight ?? "Не указан"}
              </p>
              <button
                type="button"
                onClick={() => acceptOrder(order.idOrder)}
                disabled={isAcceptPending || Boolean(activeOrder)}
                className="mt-3 rounded-lg px-4 py-2 font-semibold text-white bg-primary disabled:opacity-60"
              >
                {isAcceptPending ? "Принятие..." : "Принять заказ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
