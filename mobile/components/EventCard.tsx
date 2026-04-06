import { Pressable, Text, View } from "react-native";
import type { Event } from "../hooks/useEvents";
import { useTheme } from "../hooks/useTheme";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type EventCardProps = {
  event: Event;
  onToggleSignUp: (id: number) => void;
  onPress?: () => void;
};

export default function EventCard({ event, onToggleSignUp, onPress }: EventCardProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`mx-5 mb-3 rounded-xl border p-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}
    >
      {/* Top row: category chip + date */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-accent-500 rounded-full px-3 py-0.5">
          <Text className="text-white font-inter-medium text-xs">
            {event.category}
          </Text>
        </View>
        <Text
          className={`font-inter text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {formatDate(event.date)}
        </Text>
      </View>

      {/* Title */}
      <Text
        className={`font-inter-semibold text-base mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}
      >
        {event.title}
      </Text>

      {/* Org · Location */}
      <Text
        className={`font-inter text-sm mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {event.organization}{event.location ? ` · ${event.location}` : ""}
      </Text>

      {/* Sign Up button */}
      <View className="items-end">
        <Pressable
          onPress={() => onToggleSignUp(event.id)}
          className={`rounded-full px-5 py-2 ${
            event.isSignedUp
              ? "border border-accent-500 bg-transparent"
              : "bg-accent-500"
          }`}
        >
          <Text
            className={`font-inter-medium text-sm ${
              event.isSignedUp ? "text-accent-500" : "text-white"
            }`}
          >
            {event.isSignedUp ? "Signed Up ✓" : "Sign Up"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
