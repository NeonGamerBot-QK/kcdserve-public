import { Pressable, View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../../components/TopBar";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/authStore";
import { logout } from "../../lib/api/auth";
import { USE_API } from "../../lib/config";

export default function MoreScreen() {
  const { isDark, toggleDarkMode } = useTheme();
  const clearAuth = useAuthStore((s) => s.logout);

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            if (USE_API) await logout();
          } catch {
            // Server-side cleanup is best-effort; clear local state regardless
          }
          clearAuth();
          router.replace("/");
        },
      },
    ]);
  }

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-700" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <TopBar />
      <Text
        className={`font-inter-semibold text-2xl ${
          isDark ? "text-white" : "text-slate-900"
        } px-5 mt-2 mb-3`}
      >
        Settings
      </Text>
      <View className="flex-1 px-4 mt-4">
        <Pressable
          onPress={toggleDarkMode}
          className={`${bgCard} rounded-xl p-4 flex-row items-center justify-between border ${borderCard}`}
        >
          <View>
            <Text className={`font-inter-semibold text-base ${textPrimary}`}>
              Dark Mode
            </Text>
            <Text className={`font-inter text-sm ${textMuted} mt-0.5`}>
              {isDark ? "On" : "Off"}
            </Text>
          </View>
          {/* Toggle pill */}
          <View
            className={`w-12 h-7 rounded-full justify-center px-0.5 ${isDark ? "bg-primary-500" : "bg-slate-300"}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-white shadow-sm ${isDark ? "self-end" : "self-start"}`}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          className={`${bgCard} rounded-xl p-4 flex-row items-center justify-between border ${borderCard} mt-3`}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="font-inter-semibold text-base text-red-500 ml-3">
              Log out
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
