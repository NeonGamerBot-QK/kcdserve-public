import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useTheme } from "../hooks/useTheme";
import Card from "./Card";

export interface NationalHonorCardProps {
  hoursLogged: number;
  ageGroup: "kids" | "youth" | "youngAdults" | "adults";
}

const thresholds = {
  kids: { bronze: 26, silver: 50, gold: 75 },
  youth: { bronze: 50, silver: 75, gold: 100 },
  youngAdults: { bronze: 100, silver: 175, gold: 250 },
  adults: { bronze: 100, silver: 250, gold: 500 },
};

const AGE_GROUP_LABELS: Record<string, string> = {
  kids: "Kids",
  youth: "Youth",
  youngAdults: "Young Adults",
  adults: "Adults",
};

const TIER_DEFS = [
  { key: "bronze" as const, label: "Bronze", color: "#d97706", radius: 28 },
  { key: "silver" as const, label: "Silver", color: "#64748b", radius: 38 },
  { key: "gold" as const, label: "Gold", color: "#ca8a04", radius: 48 },
];

const STROKE_WIDTH = 6;
const SVG_SIZE = 116;
const CENTER = SVG_SIZE / 2;

type TierKey = "bronze" | "silver" | "gold";
type TierStatus = "achieved" | "active" | "locked";

export default function NationalHonorCard({
  hoursLogged,
  ageGroup,
}: NationalHonorCardProps) {
  const { isDark } = useTheme();
  const t = thresholds[ageGroup];
  const tierThreshold: Record<TierKey, number> = {
    bronze: t.bronze,
    silver: t.silver,
    gold: t.gold,
  };
  const goldAchieved = hoursLogged >= t.gold;

  const getStatus = (key: TierKey): TierStatus => {
    if (hoursLogged >= tierThreshold[key]) return "achieved";
    const firstUnachieved = (["bronze", "silver", "gold"] as TierKey[]).find(
      (k) => hoursLogged < tierThreshold[k],
    )!;
    return key === firstUnachieved ? "active" : "locked";
  };

  const getProgress = (key: TierKey): number => {
    const status = getStatus(key);
    if (status === "achieved") return 1;
    if (status === "active")
      return Math.min(hoursLogged / tierThreshold[key], 1);
    return 0;
  };

  const activeTierDef = TIER_DEFS.find((d) => getStatus(d.key) === "active");
  const hoursToNext = activeTierDef
    ? tierThreshold[activeTierDef.key] - hoursLogged
    : 0;

  return (
    // Outer View carries the shadow; bg must match Card's bg for shadow to render on iOS
    <View
      className="mx-5 mt-5 rounded-2xl"
      style={{
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Card className="p-0">
        {/* Header */}
        <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
          <View className="flex-1 mr-3">
            <Text
              className={`font-inter-bold text-xl ${isDark ? "text-white" : "text-slate-900"}`}
            >
              National Service Honor
            </Text>
            <Text
              className={`font-inter text-sm ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}
            >
              {AGE_GROUP_LABELS[ageGroup]} · {hoursLogged} hrs logged
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1.5 self-start"
            style={{ backgroundColor: isDark ? "#78350f" : "#fef3c7" }}
          >
            <Text
              className="font-inter-semibold text-sm"
              style={{ color: isDark ? "#fef3c7" : "#92400e" }}
            >
              {goldAchieved ? "Gold Achieved 🥇" : "In Progress"}
            </Text>
          </View>
        </View>

        {/* Middle: rings + legend */}
        <View className="flex-row items-center px-5 pb-4">
          {/* Concentric SVG rings */}
          <View style={{ width: SVG_SIZE, height: SVG_SIZE }}>
            <Svg
              width={SVG_SIZE}
              height={SVG_SIZE}
              style={{ position: "absolute" }}
            >
              <G transform={`rotate(-90, ${CENTER}, ${CENTER})`}>
                {TIER_DEFS.map(({ key, color, radius }) => {
                  const circumference = 2 * Math.PI * radius;
                  const progress = getProgress(key);
                  const status = getStatus(key);

                  return (
                    <G key={key}>
                      {/* Background track */}
                      <Circle
                        cx={CENTER}
                        cy={CENTER}
                        r={radius}
                        stroke={color}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        opacity={status === "locked" ? 0.12 : 0.15}
                      />
                      {/* Progress arc */}
                      {progress > 0 && (
                        <Circle
                          cx={CENTER}
                          cy={CENTER}
                          r={radius}
                          stroke={color}
                          strokeWidth={STROKE_WIDTH}
                          fill="none"
                          strokeDasharray={`${circumference} ${circumference}`}
                          strokeDashoffset={circumference * (1 - progress)}
                          strokeLinecap="round"
                        />
                      )}
                    </G>
                  );
                })}
              </G>
            </Svg>

            {/* Center text overlay */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                className={`font-inter-bold ${isDark ? "text-white" : "text-slate-900"}`}
                style={{ fontSize: 22, lineHeight: 24 }}
              >
                {hoursLogged}
              </Text>
              <Text
                className="font-inter text-xs text-slate-400"
                style={{ marginTop: -2 }}
              >
                hrs
              </Text>
            </View>
          </View>

          {/* Tier legend */}
          <View className="flex-1 ml-6">
            {TIER_DEFS.map(({ key, label, color }) => {
              const status = getStatus(key);
              const threshold = tierThreshold[key];
              const progress = getProgress(key);
              const isActive = status === "active";
              const isLocked = status === "locked";
              const dimOpacity = 0.35;

              return (
                <View key={key} style={{ marginBottom: 8 }}>
                  {/* Label row */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: color,
                          marginRight: 8,
                          opacity: isLocked ? dimOpacity : 1,
                        }}
                      />
                      <Text
                        className="font-inter-semibold text-sm"
                        style={{ color, opacity: isLocked ? dimOpacity : 1 }}
                      >
                        {label}
                      </Text>
                    </View>
                    <Text
                      className="font-inter text-sm"
                      style={{
                        color: isActive ? color : "#94a3b8",
                        opacity: isLocked ? dimOpacity : 1,
                      }}
                    >
                      {isActive
                        ? `${hoursLogged} / ${threshold} hrs`
                        : `${threshold} hrs`}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={{ height: 3, marginTop: 6 }}>
                    {/* Track */}
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: color,
                        opacity: isLocked ? 0.1 : 0.15,
                      }}
                    />
                    {/* Fill */}
                    {progress > 0 && (
                      <View
                        style={{
                          width: `${progress * 100}%`,
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: color,
                        }}
                      />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Footer nudge bar */}
        {!goldAchieved && activeTierDef && (
          <View
            className="mx-4 mb-4 rounded-xl px-4 py-3 flex-row items-center"
            style={{ backgroundColor: isDark ? "#78350f" : "#fffbeb" }}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color="#d97706"
              style={{ marginRight: 8 }}
            />
            <Text
              className="font-inter-medium text-sm"
              style={{ color: isDark ? "#fef3c7" : "#92400e" }}
            >
              {hoursToNext} more hours to earn {activeTierDef.label}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
