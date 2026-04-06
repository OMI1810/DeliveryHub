"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import addressService from "@/services/address.service";
import { IAddress, ICreateAddressDto } from "@/types/address.types";
import { AddressForm } from "./AddressForm";
import { MiniLoader } from "@/components/ui/MiniLoader";
import toast from "react-hot-toast";

export function AddressList() {
  const queryClient = useQueryClient();
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getAll(),
  });

  const addresses: IAddress[] = data?.data?.map((au) => au.address) ?? [];

  const createMutation = useMutation({
    mutationFn: (dto: ICreateAddressDto) => addressService.create(dto),
    onSuccess: () => {
      toast.success("Адрес добавлен");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setIsAdding(false);
    },
    onError: () => {
      toast.error("Не удалось добавить адрес");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ICreateAddressDto }) =>
      addressService.update(id, dto),
    onSuccess: () => {
      toast.success("Адрес обновлён");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingAddress(null);
    },
    onError: () => {
      toast.error("Не удалось обновить адрес");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => {
      toast.success("Адрес удалён");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingAddress(null);
    },
    onError: () => {
      toast.error("Не удалось удалить адрес");
    },
  });

  const handleCreate = (dto: ICreateAddressDto) => {
    createMutation.mutate(dto);
  };

  const handleUpdate = (dto: ICreateAddressDto) => {
    if (!editingAddress) return;
    updateMutation.mutate({ id: editingAddress.idAddress, dto });
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить этот адрес?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <MiniLoader />
      </div>
    );
  }

  // Editing form
  if (editingAddress) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Редактировать адрес</h3>
        <AddressForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingAddress(null)}
          isLoading={updateMutation.isPending}
          initialData={editingAddress}
        />
      </div>
    );
  }

  // Adding form
  if (isAdding) {
    return (
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Новый адрес</h3>
        <AddressForm
          onSubmit={handleCreate}
          onCancel={() => setIsAdding(false)}
          isLoading={createMutation.isPending}
        />
      </div>
    );
  }

  // Address list
  return (
    <div className="space-y-3">
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📍</div>
          <p className="text-zinc-400 text-sm">Нет сохранённых адресов</p>
          <p className="text-zinc-600 text-xs mt-1">
            Добавьте адрес для доставки
          </p>
        </div>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr.idAddress}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{addr.address}</p>
                {(addr.flat || addr.floor || addr.entrance) && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {addr.flat && (
                      <span className="text-[10px] bg-zinc-700 px-2 py-0.5 rounded">
                        Кв. {addr.flat}
                      </span>
                    )}
                    {addr.floor && (
                      <span className="text-[10px] bg-zinc-700 px-2 py-0.5 rounded">
                        Этаж {addr.floor}
                      </span>
                    )}
                    {addr.entrance && (
                      <span className="text-[10px] bg-zinc-700 px-2 py-0.5 rounded">
                        Подъезд {addr.entrance}
                      </span>
                    )}
                  </div>
                )}
                {addr.doorphone && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Домофон: {addr.doorphone}
                  </p>
                )}
                {addr.comment && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {addr.comment}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={() => setEditingAddress(addr)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 active:bg-zinc-700 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(addr.idAddress)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 active:bg-zinc-700 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add button */}
      <button
        onClick={() => setIsAdding(true)}
        className="w-full border border-dashed border-zinc-700 rounded-xl p-4 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Добавить адрес
      </button>
    </div>
  );
}
