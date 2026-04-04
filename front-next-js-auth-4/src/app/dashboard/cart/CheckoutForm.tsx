"use client";
import { instance } from "@/api/axios";
import addressService from "@/services/address.service";
import { IAddressUser } from "@/types/address.types";
import { CartItem } from "@/types/cart.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MiniLoader } from "@/components/ui/MiniLoader";
import { FiX, FiMapPin, FiShoppingBag, FiCheckCircle } from "react-icons/fi";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiShoppingBag className="w-5 h-5 text-gray-700" />
            Оформление заказа
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Тело */}
        <div className="p-6 space-y-5">
          {/* Ресторан */}
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">Ресторан</p>
            <p className="font-semibold text-gray-900">{restaurantName}</p>
          </div>

          {/* Товары */}
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Товары ({items.reduce((s, i) => s + i.quantity, 0)})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {item.price * item.quantity} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Адрес */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1 text-gray-700">
              <FiMapPin className="w-4 h-4" />
              Адрес доставки *
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
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900 bg-white"
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
              <p className="text-xs text-gray-500 mt-1">
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
          <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Итого</span>
            <span className="text-2xl font-bold text-primary">{total} ₽</span>
          </div>

          {/* Ошибка */}
          {error && (
            <p className="text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {(error as Error).message}
            </p>
          )}
        </div>

        {/* Футер */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !selectedAddressId}
            className="flex-1 bg-primary text-white px-4 py-3 rounded-xl hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <MiniLoader /> Оформление...
              </>
            ) : (
              <>
                <FiCheckCircle /> Подтвердить заказ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
