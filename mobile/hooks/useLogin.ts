import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { login } from "../lib/api/auth";
import { useAuthStore } from "../store/authStore";

/**
 * Mutation hook for email/password login.
 * On success, stores the token and navigates to the dashboard.
 */
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.expires_at, data.user);
      router.replace("/(tabs)/dashboard");
    },
  });
}
