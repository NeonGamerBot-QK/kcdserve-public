import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { USE_API } from "../lib/config";

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!USE_API || hydrated) {
      if (USE_API && isAuthenticated()) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [hydrated]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
