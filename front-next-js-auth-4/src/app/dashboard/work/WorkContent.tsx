"use client";

import { MiniLoader } from "@/components/ui/MiniLoader";
import { useProfile } from "@/hooks/useProfile";
import userService from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { OrderDiscovery } from "../profile/OrderDiscovery";
import { ShiftToggle } from "../profile/ShiftToggle";

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
    return <p>Loading...</p>;
  }

  if (!hasDeliverymanRole) {
    return (
      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-bold mb-4">Стать курьером</h2>
        <p className="text-zinc-400 mb-6">
          Получите роль курьера, чтобы принимать заказы на доставку.
        </p>
        <button
          onClick={() => becomeDeliveryman.mutate()}
          disabled={becomeDeliveryman.isPending}
          className="bg-primary text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {becomeDeliveryman.isPending ? (
            <MiniLoader width={20} height={20} />
          ) : (
            "Получить роль курьера"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-8">
      <h2 className="text-2xl font-bold mb-2">Work</h2>
      <ShiftToggle />
      <OrderDiscovery />
    </div>
  );
}
