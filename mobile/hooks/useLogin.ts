import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { requestLoginPin, verifyLoginPin } from "../lib/api/auth";
import { useAuthStore } from "../store/authStore";

/** Mutation hook to request a login PIN email. */
export function useRequestPin() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => requestLoginPin(email),
  });
}

/**
 * Mutation hook to verify the emailed PIN.
 * On success, stores the token and navigates to the dashboard.
 */
export function useVerifyPin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, pin }: { email: string; pin: string }) =>
      verifyLoginPin(email, pin),
    onSuccess: (data) => {
      setAuth(data.token, data.expires_at, data.user);
      router.replace("/(tabs)/dashboard");
    },
  });
}
