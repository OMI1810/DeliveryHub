"use client";

import { MiniLoader } from "@/components/ui/MiniLoader";
import { PUBLIC_PAGES } from "@/config/pages/public.config";
import { useProfile } from "@/hooks/useProfile";
import authService from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ProfileInfo() {
  const router = useRouter();
  const { isLoading, refetch, user } = useProfile();
  const [isPending, startTransition] = useTransition();

  const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authService.logout(),
    onSuccess() {
      refetch();
      startTransition(() => {
        router.push(PUBLIC_PAGES.LOGIN);
      });
    },
  });

  const isLogoutLoading = isLogoutPending || isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <MiniLoader width={40} height={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-500 text-xl font-bold">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <h1 className="text-lg font-bold">
            {user?.name || "Пользователь"}
          </h1>
          <p className="text-xs text-zinc-400">{user?.email}</p>
        </div>
      </div>

      {/* Email status */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <p className="text-xs text-zinc-400 mb-1">Email</p>
        <p className="text-sm flex items-center gap-2">
          {user?.email}
          {user?.verificationToken ? (
            <span className="text-orange-400 text-xs">⏳ Не подтверждён</span>
          ) : (
            <span className="text-emerald-500 text-xs">✓ Подтверждён</span>
          )}
        </p>
      </div>

      {/* Roles */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <p className="text-xs text-zinc-400 mb-2">Роли</p>
        <div className="flex flex-wrap gap-2">
          {user?.isGod && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
              GOD
            </span>
          )}
          {user?.isModerator && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
              MODERATOR
            </span>
          )}
          {user?.isOwner && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg">
              OWNER
            </span>
          )}
          {user?.isDeliveryman && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">
              DELIVERYMAN
            </span>
          )}
          {user?.isCashier && (
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg">
              CASHIER
            </span>
          )}
          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-lg">
            CLIENT
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => mutateLogout()}
        disabled={isLogoutLoading}
        className="w-full bg-zinc-800 border border-zinc-700 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium active:bg-zinc-700 disabled:opacity-50"
      >
        {isLogoutLoading ? <MiniLoader /> : "Выйти"}
      </button>
    </div>
  );
}
