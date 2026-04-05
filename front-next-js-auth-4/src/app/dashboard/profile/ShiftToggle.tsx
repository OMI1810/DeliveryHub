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
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-3">Управление сменой</h3>
      <button
        type="button"
        onClick={() => toggleShift()}
        disabled={isDisabled}
        className="w-full max-w-sm rounded-lg px-6 py-4 text-lg font-semibold text-white transition-opacity disabled:opacity-60 bg-primary"
      >
        {isPending ? "Обработка..." : buttonLabel}
      </button>
    </div>
  );
}
