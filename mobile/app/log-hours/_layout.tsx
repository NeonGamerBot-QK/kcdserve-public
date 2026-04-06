import { Stack } from "expo-router";

export default function LogHoursLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="verify"
        options={{ gestureEnabled: false }}
      />
    </Stack>
  );
}
