import { View, Text } from "react-native";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import { useTheme } from "../hooks/useTheme";

type OrgCardProps = {
  name: string;
  current: number;
  total: number | null;
};

export default function OrgCard({
  name,
  current,
  total,
}: OrgCardProps) {
  const { isDark } = useTheme();
  const hasGoal = total !== null && total > 0;

  return (
    <Card className="mb-3 px-6 py-5">
      <View className="flex-row justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text
            className={`font-inter-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {name}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`font-inter-semibold text-base ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {hasGoal ? `${current} / ${total}` : `${current}`}
          </Text>
          <Text
            className={`font-inter-medium text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            HOURS
          </Text>
        </View>
      </View>
      {hasGoal && <ProgressBar current={current} total={total} />}
    </Card>
  );
}
