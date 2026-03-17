import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { USE_API } from "../lib/config";

type TopBarProps = {
  /** If provided, shows a teal avatar circle with the initial; otherwise shows a user icon */
  initial?: string;
};

export default function TopBar({ initial }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const isAdmin =
    USE_API && (user?.role === "admin" || user?.role === "super_admin");

  // Use first letter of user's name if available and no explicit initial
  const displayInitial =
    initial ?? (USE_API && user ? user.first_name[0] : undefined);

  return (
    <View className="flex-row items-center mb-4 px-5 pt-2 pb-3 border-b border-slate-200">
      {displayInitial ? (
        <View className="w-9 h-9 rounded-full bg-accent-500 items-center justify-center">
          <Text className="font-inter-semibold text-white text-lg">
            {displayInitial}
          </Text>
        </View>
      ) : (
        <View className="w-9 h-9 rounded-full bg-slate-200 items-center justify-center">
          <Ionicons name="person" size={18} color="#64748b" />
        </View>
      )}
      <View className="absolute left-0 right-0 items-center">
        {isAdmin ? (
          <View
            style={{
              borderWidth: 2,
              borderColor: "#f97316",
              borderStyle: "dashed",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 2,
              backgroundColor: "#fff7ed",
            }}
          >
            <Text className="font-inter-semibold text-lg text-slate-900">
              KCDServe
            </Text>
          </View>
        ) : (
          <Text className="font-inter-semibold text-lg text-slate-900">
            KCDServe
          </Text>
        )}
      </View>
    </View>
  );
}
