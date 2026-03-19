import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";
import Card from "./Card";
import { useTheme } from "../hooks/useTheme";

type ServiceHourCardProps = {
  title: string;
  org: string;
  date: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  icon?: string;
};

export default function ServiceHourCard({
  title,
  org,
  date,
  hours,
  status,
  icon = "time-outline",
}: ServiceHourCardProps) {
  const { isDark } = useTheme();

  return (
    <Card className="flex-row items-center py-5 px-5 mx-5 my-1">
      <View
        className={`w-10 h-10 rounded-full ${isDark ? "bg-primary-950" : "bg-primary-50"} items-center justify-center mr-3`}
      >
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text
          className={`font-inter-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {title}
        </Text>
        <Text
          className={`font-inter text-xs ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}
        >
          {org} · {date}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-inter-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {hours}h
        </Text>
        <View className="mt-0.5">
          <StatusBadge status={status} />
        </View>
      </View>
    </Card>
  );
}
