import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import OrgCard from "../../components/OrgCard";
import { USE_API } from "../../lib/config";
import { useDashboard } from "../../hooks/useDashboard";
import { useTheme } from "../../hooks/useTheme";

// Fallback mock data for dev mode without SERVER_URL
const MOCK = {
  approved_hours: 42.5,
  pending_hours: 8.0,
  groups: [
    {
      id: 1,
      name: "National Honor Society",
      current_hours: 18,
      total_approved_hours: 25,
    },
    { id: 2, name: "Key Club", current_hours: 12.5, total_approved_hours: 20 },
    {
      id: 3,
      name: "Student Council",
      current_hours: 12,
      total_approved_hours: 15,
    },
  ],
};

export default function DashboardScreen() {
  const { data, isLoading, isError } = useDashboard();
  const { isDark } = useTheme();

  const dashboard = USE_API ? data : MOCK;

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-700" : "border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <ScrollView className="flex-1">
        <TopBar />

        {USE_API && isLoading && (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {USE_API && isError && (
          <View className="items-center mt-10 px-5">
            <Text className="font-inter text-base text-red-500 text-center">
              Failed to load dashboard. Pull down to retry.
            </Text>
          </View>
        )}

        {dashboard && (
          <>
            {/* Stats hero */}
            <View className="items-center mt-4 mb-5">
              <Text
                className={`font-inter-medium text-sm uppercase tracking-wider ${textMuted} mb-1`}
              >
                TOTAL APPROVED
              </Text>
              <Text
                className={`font-inter-semibold text-6xl ${textPrimary} mt-1.5`}
              >
                {dashboard.approved_hours}
              </Text>
              <Text className={`font-inter text-base ${textMuted} mt-1`}>
                Hours completed this year
              </Text>
            </View>

            {/* Pending pill */}
            <View className="items-center mb-8">
              <View
                className={`flex-row items-center ${bgCard} rounded-2xl px-5 py-4 border ${borderCard}`}
              >
                <View className="w-2 h-2 rounded-full bg-status-pending mr-2" />
                <Text className={`font-inter-medium text-sm ${textPrimary}`}>
                  {dashboard.pending_hours} Pending
                </Text>
              </View>
            </View>

            {/* Groups */}
            {dashboard.groups.length > 0 && (
              <View className="px-5">
                <View className="flex-row justify-between items-center mb-3">
                  <Text
                    className={`font-inter-semibold text-sm uppercase tracking-wider ${textMuted}`}
                  >
                    GROUPS
                  </Text>
                  <Pressable>
                    <Text className="font-inter-medium text-sm text-primary-500">
                      View all
                    </Text>
                  </Pressable>
                </View>

                {dashboard.groups.map((group) => (
                  <OrgCard
                    key={group.id}
                    name={group.name}
                    deadline=""
                    current={group.current_hours}
                    total={group.total_approved_hours}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
