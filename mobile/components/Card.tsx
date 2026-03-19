import { View } from "react-native";
import { useTheme } from "../hooks/useTheme";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  const { isDark } = useTheme();

  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-700" : "border-gray-200";

  return (
    <View
      className={`${bgCard} rounded-2xl border ${borderCard} p-4 ${className}`}
    >
      {children}
    </View>
  );
}
