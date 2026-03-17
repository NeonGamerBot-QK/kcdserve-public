import { Pressable, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../../components/TopBar';
import { useTheme } from '../../hooks/useTheme';

export default function MoreScreen() {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <TopBar initial="J" />
      <View className="flex-1 px-4 pt-6">
        <Text className="font-inter-semibold text-xl text-slate-900 dark:text-white">
          Settings
        </Text>

        <View className="mt-6 space-y-3">
          <Pressable
            onPress={toggleDarkMode}
            className="bg-white dark:bg-slate-900 rounded-lg p-4 flex-row items-center justify-between border border-slate-200 dark:border-slate-700"
          >
            <View>
              <Text className="font-inter-semibold text-base text-slate-900 dark:text-white">
                Dark Mode
              </Text>
              <Text className="font-inter text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isDark ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View className={`w-12 h-6 rounded-full ${isDark ? 'bg-primary-500' : 'bg-slate-300'}`}>
              <View
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 ${isDark ? 'right-0.5' : 'left-0.5'}`}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
