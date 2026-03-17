import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { USE_API } from '../lib/config';

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Wait for persisted auth state to rehydrate before routing
  if (USE_API && !hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If API is active and user has a valid token, go straight to dashboard
  if (USE_API && isAuthenticated()) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Otherwise show the login screen
  return <Redirect href="/(auth)/login" />;
}
