import { View, Text } from "react-native";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import { useTheme } from "../hooks/useTheme";

type OrgCardProps = {
  name: string;
  deadline: string;
  current: number;
  total: number;
};

export default function OrgCard({
  name,
  deadline,
  current,
  total,
}: OrgCardProps) {
  const { isDark } = useTheme();

  return (
    <Card className="mb-3">
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={`font-inter-semibold text-base ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {name}
        </Text>
        <Text
          className={`font-inter text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {deadline}
        </Text>
      </View>
      <ProgressBar current={current} total={total} />
      <Text
        className={`font-inter-medium text-xs ${isDark ? "text-slate-400" : "text-slate-500"} mt-1.5`}
      >
        {current} / {total} hours
      </Text>
    </Card>
  );
}
