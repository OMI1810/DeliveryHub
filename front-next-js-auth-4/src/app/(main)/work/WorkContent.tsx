"use client";

import { MiniLoader } from "@/components/ui/MiniLoader";
import { useProfile } from "@/hooks/useProfile";
import userService from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { OrderDiscovery } from "./OrderDiscovery";
import { ShiftToggle } from "./ShiftToggle";

export function WorkContent() {
  const { isLoading, user } = useProfile();
  const queryClient = useQueryClient();

  const hasDeliverymanRole = user?.isDeliveryman === true;

  const becomeDeliveryman = useMutation({
    mutationFn: () => userService.becomeDeliveryman(),
    onSuccess: (res) => {
      toast.success(
        res.data.message === "Already a deliveryman"
          ? "Вы уже курьер"
          : "Роль курьера добавлена!",
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast.error("Не удалось получить роль курьера");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <MiniLoader />
      </div>
    );
  }

  if (!hasDeliverymanRole) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🚴</div>
        <h2 className="text-lg font-bold mb-2">Стать курьером</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Получите роль курьера, чтобы принимать заказы на доставку.
        </p>
        <button
          onClick={() => becomeDeliveryman.mutate()}
          disabled={becomeDeliveryman.isPending}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium active:bg-emerald-700 disabled:opacity-50 w-full max-w-xs"
        >
          {becomeDeliveryman.isPending ? (
            <MiniLoader />
          ) : (
            "Получить роль курьера"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Работа</h1>
      <ShiftToggle />
      <OrderDiscovery />
    </div>
  );
}
