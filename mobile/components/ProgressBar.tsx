import { View } from "react-native";

type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <View className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <View
        className="h-full rounded-full bg-primary-500 mb-1"
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}
