import userService from "@/services/user.service";
import { transformUserToState } from "@/utils/transform-user-to-state";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.fetchProfile(),
    refetchInterval: 1_800_000, // 30 minutes
  });

  const profile = data?.data ?? null;
  const userState = profile ? transformUserToState(profile) : null;

  return {
    isLoading,
    error,
    refetch,
    user: userState,
    profile,
  };
}
