import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TopBarProps = {
  /** If provided, shows a teal avatar circle with the initial; otherwise shows a user icon */
  initial?: string;
};

export default function TopBar({ initial }: TopBarProps) {
  return (
    <View className="flex-row items-center mb-4 px-5 pt-2 pb-3 border-b border-slate-200">
      {initial ? (
        <View className="w-9 h-9 rounded-full bg-accent-500 items-center justify-center">
          <Text className="font-inter-semibold text-white text-lg">
            {initial}
          </Text>
        </View>
      ) : (
        <View className="w-9 h-9 rounded-full bg-slate-200 items-center justify-center">
          <Ionicons name="person" size={18} color="#64748b" />
        </View>
      )}
      <View className="absolute left-0 right-0 items-center">
        <Text className="font-inter-semibold text-lg text-slate-900">
          KCDServe
        </Text>
      </View>
    </View>
  );
}
