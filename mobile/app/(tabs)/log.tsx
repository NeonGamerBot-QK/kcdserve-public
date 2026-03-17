import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import { useTheme } from "../../hooks/useTheme";

export default function LogScreen() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <TopBar />
      <View className="flex-1 items-center justify-center">
        <Text className={`font-inter-semibold text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
          Log Hours
        </Text>
        <Text className="font-inter text-base text-slate-500 mt-2">
          Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
