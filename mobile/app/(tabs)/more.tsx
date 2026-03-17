import { Pressable, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../../components/TopBar';
import { useTheme } from '../../hooks/useTheme';

export default function MoreScreen() {
  const { isDark, toggleDarkMode } = useTheme();

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-700" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <TopBar />
      <View className="flex-1 px-4 pt-6">
        <Text className={`font-inter-semibold text-xl ${textPrimary}`}>
          Settings
        </Text>

        <View className="mt-6">
          <Pressable
            onPress={toggleDarkMode}
            className={`${bgCard} rounded-xl p-4 flex-row items-center justify-between border ${borderCard}`}
          >
            <View>
              <Text className={`font-inter-semibold text-base ${textPrimary}`}>
                Dark Mode
              </Text>
              <Text className={`font-inter text-sm ${textMuted} mt-0.5`}>
                {isDark ? 'On' : 'Off'}
              </Text>
            </View>
            {/* Toggle pill */}
            <View
              className={`w-12 h-7 rounded-full justify-center px-0.5 ${isDark ? 'bg-primary-500' : 'bg-slate-300'}`}
            >
              <View
                className={`w-6 h-6 rounded-full bg-white shadow-sm ${isDark ? 'self-end' : 'self-start'}`}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
