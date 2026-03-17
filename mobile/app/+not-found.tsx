import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center px-5">
        <Text className="font-inter-semibold text-xl text-slate-900">
          Page not found
        </Text>
        <Text className="font-inter text-base text-slate-500 mt-2 text-center">
          This screen doesn't exist yet.
        </Text>
        <Pressable
          className="mt-6 bg-primary-500 rounded-xl px-6 py-3"
          onPress={() => router.replace('/(tabs)/dashboard')}
        >
          <Text className="font-inter-semibold text-base text-white">
            Go to Dashboard
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
