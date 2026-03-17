import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { USE_API } from "../lib/config";
import { useTheme } from "../hooks/useTheme";

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isDark } = useTheme();

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
    <View className={`flex-1 items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
