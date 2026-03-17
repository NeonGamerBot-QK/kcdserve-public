import { Pressable, Text } from "react-native";
import { useTheme } from "../hooks/useTheme";

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export default function FilterChip({
  label,
  active = false,
  onPress,
}: FilterChipProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 mr-2 border ${
        active
          ? "bg-primary-500 border-primary-500"
          : isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300"
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
