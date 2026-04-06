"use client";

import dynamic from "next/dynamic";
import orderDiscoveryService from "@/services/order-discovery.service";
import shiftService from "@/services/shift.service";
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

  // Check if courier is online
  const { data: shiftData } = useQuery({
    queryKey: ["shift-state"],
    queryFn: () => shiftService.fetchShiftState(),
    refetchInterval: 10000,
  });

  const isOnline = shiftData?.data?.isOnline ?? false;

  const {
    data: activeOrderData,
    isLoading: isLoadingActiveOrder,
    isFetching: isFetchingActiveOrder,
    refetch: refetchActiveOrder,
  } = useQuery({
    queryKey: ["active-order"],
    queryFn: () => orderDiscoveryService.fetchActiveOrder(),
    refetchOnReconnect: true,
    refetchInterval: 5000,
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
    refetchInterval: 10000,
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Доставка заказов</h2>
        <button
          type="button"
          onClick={() => {
            refetchActiveOrder();
            if (!activeOrder) refetchDiscovery();
          }}
          disabled={isRefreshing}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-60"
        >
          {isRefreshing ? "Обновление..." : "Обновить"}
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-zinc-500 text-sm">Загрузка...</p>
        </div>
      ) : activeOrder ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3">
          <p className="text-sm">
            <span className="text-zinc-400">Заказ:</span>{" "}
            <span className="font-semibold">{activeOrder.orderNumber}</span>
          </p>
          <p className="text-sm">
            <span className="text-zinc-400">Клиент:</span>{" "}
            <span className="font-semibold">{activeOrder.customerName}</span>
          </p>

          {/* Карта: ресторан при COURIER_ACCEPTED, обе точки при FROM_DELIVERYMAN */}
          {activeOrder.status === "COURIER_ACCEPTED" &&
            activeOrder.restaurantCoordinates &&
            activeOrder.restaurantCoordinates.lat !== 0 &&
            activeOrder.restaurantCoordinates.lon !== 0 && (
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  📍 Забрать: {activeOrder.restaurantAddress}
                </p>
                <CourierMap
                  key={`restaurant-${activeOrder.idOrder}`}
                  points={[
                    {
                      lat: activeOrder.restaurantCoordinates.lat,
                      lon: activeOrder.restaurantCoordinates.lon,
                      label: activeOrder.restaurantAddress,
                      color: "restaurant" as const,
                    },
                  ]}
                  showRoute={false}
                />
              </div>
            )}

          {activeOrder.status === "COURIER_ACCEPTED" &&
            (!activeOrder.restaurantCoordinates ||
              activeOrder.restaurantCoordinates.lat === 0 ||
              activeOrder.restaurantCoordinates.lon === 0) && (
              <p className="text-xs text-zinc-400">
                📍 Забрать: {activeOrder.restaurantAddress} (координаты не
                указаны)
              </p>
            )}

          {activeOrder.status === "FROM_DELIVERYMAN" &&
            activeOrder.customerCoordinates &&
            activeOrder.restaurantCoordinates && (
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  📍 Доставить: {activeOrder.customerAddress}
                </p>
                <CourierMap
                  key={`delivery-${activeOrder.idOrder}`}
                  points={[
                    {
                      lat: activeOrder.restaurantCoordinates.lat,
                      lon: activeOrder.restaurantCoordinates.lon,
                      label: `Ресторан: ${activeOrder.restaurantAddress}`,
                      color: "restaurant" as const,
                    },
                    {
                      lat: activeOrder.customerCoordinates.lat,
                      lon: activeOrder.customerCoordinates.lon,
                      label: `Клиент: ${activeOrder.customerAddress}`,
                      color: "customer" as const,
                    },
                  ]}
                  showRoute
                />
              </div>
            )}

          {activeOrder.status === "FROM_DELIVERYMAN" &&
            activeOrder.customerCoordinates &&
            !activeOrder.restaurantCoordinates && (
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  📍 Доставить: {activeOrder.customerAddress}
                </p>
                <CourierMap
                  key={`customer-only-${activeOrder.idOrder}`}
                  points={[
                    {
                      lat: activeOrder.customerCoordinates.lat,
                      lon: activeOrder.customerCoordinates.lon,
                      label: activeOrder.customerAddress,
                      color: "customer" as const,
                    },
                  ]}
                  showRoute={false}
                />
              </div>
            )}

          <p className="text-sm">
            <span className="text-zinc-400">Комментарии:</span>{" "}
            {activeOrder.comments || "Нет"}
          </p>

          <div>
            <p className="text-xs text-zinc-400 mb-1">Позиции:</p>
            <ul className="space-y-0.5">
              {activeOrder.items.map((item) => (
                <li key={item.idProduct} className="text-xs text-zinc-300">
                  • {item.name}
                </li>
              ))}
            </ul>
          </div>

          {activeOrder.status === "FROM_DELIVERYMAN" && (
            <button
              type="button"
              onClick={() => completeOrder(activeOrder.idOrder)}
              disabled={isCompletePending}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:opacity-60"
            >
              {isCompletePending ? "Обработка..." : "Завершить заказ"}
            </button>
          )}
        </div>
      ) : uniqueOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-zinc-400 text-sm">Нет доступных заказов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueOrders.map((order) => (
            <div
              key={order.idOrder}
              className="rounded-xl border border-zinc-700/60 p-4 space-y-2"
            >
              <p className="text-xs">
                <span className="text-zinc-400">Адрес:</span>{" "}
                {order.pickupAddress || "Не указан"}
              </p>
              <p className="text-xs">
                <span className="text-zinc-400">Вес:</span>{" "}
                {order.weight ?? "Не указан"}
              </p>
              <button
                type="button"
                onClick={() => acceptOrder(order.idOrder)}
                disabled={isAcceptPending || Boolean(activeOrder) || !isOnline}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:opacity-60"
              >
                {!isOnline
                  ? "Начните смену"
                  : isAcceptPending
                    ? "Принятие..."
                    : "Принять заказ"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
