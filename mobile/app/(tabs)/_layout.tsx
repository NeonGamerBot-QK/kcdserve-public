import { View, Pressable } from "react-native";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

function FABButton() {
  return (
    <Pressable
      onPress={() => router.push("/log-hours" as any)}
      className="w-14 h-14 rounded-full -mb-2 bg-primary-500 items-center justify-center shadow-lg"
      style={{ elevation: 5 }}
    >
      <Ionicons name="add" size={32} color="white" />
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 85,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "",
          tabBarIcon: () => <FABButton />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/log-hours' as any);
          },
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
