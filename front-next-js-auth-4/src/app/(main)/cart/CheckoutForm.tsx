"use client";

import { instance } from "@/api/axios";
import addressService from "@/services/address.service";
import { IAddressUser } from "@/types/address.types";
import { CartItem } from "@/types/cart.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MiniLoader } from "@/components/ui/MiniLoader";

interface Props {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CheckoutForm({
  restaurantId,
  restaurantName,
  items,
  total,
  onSuccess,
  onCancel,
}: Props) {
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAll(),
  });

  const { mutate, isPending, error } = useMutation({
    mutationKey: ["create-order"],
    mutationFn: async () => {
      const res = await instance.post("/orders", {
        restaurantId,
        addressId: selectedAddressId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      return res.data;
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const addresses: IAddressUser[] = addressesData?.data || [];
  const selectedAddress = addresses.find(
    (a) => a.addressId === selectedAddressId,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId || isPending) return;
    mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 sticky top-0 bg-zinc-900 z-10">
          <h3 className="font-semibold text-sm">Оформление заказа</h3>
          <button
            onClick={onCancel}
            className="p-2 text-zinc-400 active:text-white"
          >
            ✕
          </button>
        </div>

        {/* Тело */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ресторан */}
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-400">Ресторан</p>
            <p className="font-medium text-sm">{restaurantName}</p>
          </div>

          {/* Товары */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">
              Товары ({items.reduce((s, i) => s + i.quantity, 0)})
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-xs"
                >
                  <span className="text-zinc-300">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">{item.price * item.quantity} ₽</span>
                </div>
              ))}
            </div>
          </div>

          {/* Адрес */}
          <div>
            <label className="block text-xs font-medium mb-2 text-zinc-300">
              📍 Адрес доставки *
            </label>
            {isLoadingAddresses ? (
              <div className="flex justify-center py-4">
                <MiniLoader />
              </div>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                required
                className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Выберите адрес</option>
                {addresses.map((item: IAddressUser) => (
                  <option key={item.addressId} value={item.addressId}>
                    {item.address.address}
                  </option>
                ))}
              </select>
            )}
            {selectedAddress && (
              <p className="text-xs text-zinc-500 mt-1">
                {selectedAddress.address.flat &&
                  `Кв. ${selectedAddress.address.flat} · `}
                {selectedAddress.address.floor &&
                  `Этаж ${selectedAddress.address.floor} · `}
                {selectedAddress.address.entrance &&
                  `Подъезд ${selectedAddress.address.entrance}`}
              </p>
            )}
          </div>

          {/* Итого */}
          <div className="bg-emerald-600/10 rounded-xl p-4 flex items-center justify-between">
            <span className="font-medium text-sm">Итого</span>
            <span className="text-xl font-bold text-emerald-500">{total} ₽</span>
          </div>

          {/* Ошибка */}
          {error && (
            <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              {(error as Error).message}
            </p>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-sm font-medium active:bg-zinc-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedAddressId}
              className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:bg-zinc-700 disabled:text-zinc-500 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <MiniLoader /> Оформление...
                </>
              ) : (
                "Подтвердить"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
