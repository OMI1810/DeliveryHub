"use client";

import shiftService from "@/services/shift.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function ShiftToggle() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["shift-state"],
    queryFn: () => shiftService.fetchShiftState(),
  });

  const { mutate: toggleShift, isPending } = useMutation({
    mutationKey: ["toggle-shift"],
    mutationFn: () => {
      if (data?.data.isOnline) {
        return shiftService.stopShift();
      }
      return shiftService.startShift();
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["shift-state"] });
    },
  });

  const isOnline = Boolean(data?.data.isOnline);
  const buttonLabel = isOnline ? "Закончить смену" : "Начать смену";
  const isDisabled = isLoading || isPending;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400">Смена</p>
          <p className="text-sm font-medium">
            {isOnline ? (
              <span className="text-emerald-500">● Активна</span>
            ) : (
              <span className="text-zinc-500">Не активна</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleShift()}
          disabled={isDisabled}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 ${
            isOnline
              ? "bg-rose-600 active:bg-rose-700"
              : "bg-emerald-600 active:bg-emerald-700"
          }`}
        >
          {isPending ? "..." : buttonLabel}
        </button>
      </div>
    </div>
  );
}
