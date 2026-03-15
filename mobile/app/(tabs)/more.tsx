import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../../components/TopBar';

export default function MoreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <TopBar initial="J" />
      <View className="flex-1 items-center justify-center">
        <Text className="font-inter-semibold text-xl text-slate-900">
          Settings
        </Text>
        <Text className="font-inter text-base text-slate-500 mt-2">
          Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
