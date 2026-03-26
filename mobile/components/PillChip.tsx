import { Pressable, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

type PillChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export default function PillChip({ label, active, onPress }: PillChipProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
        active
          ? "bg-accent-500 border-accent-500"
          : isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-300"
      }`}
    >
      <Text
        className={`font-inter-medium text-sm ${
          active ? "text-white" : isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
