import { View, Text } from "react-native";

type Status = "pending" | "approved" | "rejected";

const config: Record<Status, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-status-pending", label: "PENDING" },
  approved: {
    bg: "bg-green-50",
    text: "text-status-approved",
    label: "APPROVED",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-status-rejected",
    label: "REJECTED",
  },
};

type StatusBadgeProps = {
  status: Status;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, label } = config[status];

  return (
    <View className={`${bg} rounded-full px-2.5 py-0.5`}>
      <Text className={`${text} font-inter-semibold text-xs`}>{label}</Text>
    </View>
  );
}
