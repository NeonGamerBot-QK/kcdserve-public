import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "../global.css";
import { initTheme } from "../hooks/useTheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const SHOW_DEV_BORDER =
  __DEV__ && process.env.EXPO_PUBLIC_BYE_BYE_GREEN_BORDER !== "1";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={
        SHOW_DEV_BORDER
          ? {
              flex: 1,
              borderWidth: 10,
              borderColor: "#86efac",
              borderStyle: "dashed",
            }
          : { flex: 1 }
      }
    >
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="log-hours"
            options={{ presentation: "modal", headerShown: false }}
          />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </View>
  );
}
