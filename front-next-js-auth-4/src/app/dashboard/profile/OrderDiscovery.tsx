"use client";

import orderDiscoveryService from "@/services/order-discovery.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";

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
          : message || "Failed to accept order",
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
          : message || "Failed to complete order",
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

  return (
    <div className="mt-8 w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">Order Delivery</h3>
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
          {isRefreshing ? "Refreshing..." : "Refresh"}
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
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2">
          <p>
            <span className="font-semibold">Order number:</span>{" "}
            {activeOrder.orderNumber}
          </p>
          <p>
            <span className="font-semibold">Customer:</span>{" "}
            {activeOrder.customerName}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {activeOrder.customerAddress}
          </p>
          <p>
            <span className="font-semibold">Comments:</span>{" "}
            {activeOrder.comments || "No comments"}
          </p>
          <p className="font-semibold">Items:</p>
          <ul className="list-disc pl-6">
            {activeOrder.items.map((item) => (
              <li key={item.idProduct}>
                {item.name}
                {item.description ? ` - ${item.description}` : ""}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => completeOrder(activeOrder.idOrder)}
            disabled={isCompletePending}
            className="mt-3 rounded-lg px-4 py-2 font-semibold text-white bg-primary disabled:opacity-60"
          >
            {isCompletePending ? "Processing..." : "Order Delivered"}
          </button>
        </div>
      ) : uniqueOrders.length === 0 ? (
        <p>No available orders right now.</p>
      ) : (
        <div className="space-y-3">
          {uniqueOrders.map((order) => (
            <div
              key={order.idOrder}
              className="rounded-lg border border-zinc-700/60 p-4"
            >
              <p>
                <span className="font-semibold">Pickup address:</span>{" "}
                {order.pickupAddress || "Not specified"}
              </p>
              <p>
                <span className="font-semibold">Order weight:</span>{" "}
                {order.weight ?? "Not specified"}
              </p>
              <button
                type="button"
                onClick={() => acceptOrder(order.idOrder)}
                disabled={isAcceptPending || Boolean(activeOrder)}
                className="mt-3 rounded-lg px-4 py-2 font-semibold text-white bg-primary disabled:opacity-60"
              >
                {isAcceptPending ? "Accepting..." : "Accept Order"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
