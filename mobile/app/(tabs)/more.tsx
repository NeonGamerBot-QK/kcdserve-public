import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../../components/TopBar";
import { useTheme } from "../../hooks/useTheme";
import { logout } from "../../lib/api/auth";
import { IS_DEV, SERVER_URL, USE_API } from "../../lib/config";
import { useAuthStore } from "../../store/authStore";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const BUILD_NUMBER =
  Constants.nativeBuildVersion ??
  Constants.expoConfig?.ios?.buildNumber ??
  "dev";

function SectionHeader({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <Text
      className={`font-inter-semibold text-xs uppercase tracking-widest mb-2 mt-6 px-1 ${
        isDark ? "text-slate-500" : "text-slate-400"
      }`}
    >
      {label}
    </Text>
  );
}

function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  valueColor,
  onPress,
  showChevron = true,
  isDark,
  bgCard,
  borderCard,
  textPrimary,
  textMuted,
  danger = false,
}: {
  icon?: string;
  iconColor?: string;
  label: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDark: boolean;
  bgCard: string;
  borderCard: string;
  textPrimary: string;
  textMuted: string;
  danger?: boolean;
}) {
  const labelColor = danger ? "text-red-500" : textPrimary;
  const resolvedIconColor = iconColor ?? (isDark ? "#94a3b8" : "#64748b");

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`${bgCard} rounded-xl p-4 flex-row items-center justify-between border ${borderCard} mb-2`}
    >
      <View className="flex-row items-center flex-1">
        {icon && (
          <Ionicons
            name={icon as never}
            size={20}
            color={danger ? "#ef4444" : resolvedIconColor}
          />
        )}
        <Text
          className={`font-inter-semibold text-base ${labelColor} ${icon ? "ml-3" : ""} flex-shrink`}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center ml-2">
        {value !== undefined && (
          <Text
            className={`font-inter text-sm mr-1 ${valueColor ?? textMuted}`}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
        {showChevron && onPress && (
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        )}
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const { isDark, toggleDarkMode } = useTheme();
  const clearAuth = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const queryClient = useQueryClient();

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-700" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const sharedRowProps = { isDark, bgCard, borderCard, textPrimary, textMuted };

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            if (USE_API) await logout();
          } catch {
            // Server-side cleanup is best-effort; clear local state regardless
          }
          clearAuth();
          router.replace("/");
        },
      },
    ]);
  }

  function handleViewToken() {
    if (!token) {
      Alert.alert("No token", "Not currently authenticated.");
      return;
    }
    Alert.alert("Auth Token", `${token.slice(0, 20)}…${token.slice(-10)}`, [
      { text: "Close", style: "cancel" },
      {
        text: "Share full token",
        onPress: () => Share.share({ message: token }),
      },
    ]);
  }

  function handleClearQueryCache() {
    queryClient.clear();
    Alert.alert("Done", "TanStack Query cache cleared.");
  }

  function handleClearStorage() {
    Alert.alert(
      "Clear AsyncStorage",
      "This will wipe all locally persisted data including auth and theme. The app will reset.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            clearAuth();
            router.replace("/");
          },
        },
      ],
    );
  }

  const tokenExpiry = expiresAt ? new Date(expiresAt).toLocaleString() : "N/A";

  const apiModeLabel = USE_API ? "Live API" : "Mock (no server)";
  const apiModeColor = USE_API
    ? isDark
      ? "text-green-400"
      : "text-green-600"
    : isDark
      ? "text-yellow-400"
      : "text-yellow-600";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <TopBar />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className={`font-inter-semibold text-2xl ${textPrimary} mt-2 mb-1`}
        >
          Settings
        </Text>

        {/* ── Preferences ─────────────────────────────────────── */}
        <SectionHeader label="Preferences" isDark={isDark} />
        <Pressable
          onPress={toggleDarkMode}
          className={`${bgCard} rounded-xl p-4 flex-row items-center justify-between border ${borderCard} mb-2`}
        >
          <View>
            <Text className={`font-inter-semibold text-base ${textPrimary}`}>
              Dark Mode
            </Text>
            <Text className={`font-inter text-sm ${textMuted} mt-0.5`}>
              {isDark ? "On" : "Off"}
            </Text>
          </View>
          <View
            className={`w-12 h-7 rounded-full justify-center px-0.5 ${isDark ? "bg-primary-500" : "bg-slate-300"}`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-white shadow-sm ${isDark ? "self-end" : "self-start"}`}
            />
          </View>
        </Pressable>

        {/* ── About ───────────────────────────────────────────── */}
        <SectionHeader label="About" isDark={isDark} />
        <SettingsRow
          icon="information-circle-outline"
          label="Version"
          value={`${APP_VERSION} (build ${BUILD_NUMBER})`}
          showChevron={false}
          {...sharedRowProps}
        />
        <SettingsRow
          icon="mail-outline"
          label="Send Feedback"
          onPress={() =>
            Linking.openURL(
              SERVER_URL
                ? `${SERVER_URL}/feedback`
                : "https://kcdserve.com/feedback",
            )
          }
          {...sharedRowProps}
        />

        {/* ── Dev / Debug ─────────────────────────────────────── */}
        {IS_DEV && (
          <View
            style={{
              borderWidth: 2,
              borderColor: "#86efac",
              borderStyle: "dashed",
              borderRadius: 12,
              padding: 8,
              marginTop: 16,
            }}
          >
            <SectionHeader label="Dev / Debug" isDark={isDark} />
            <SettingsRow
              icon="wifi-outline"
              label="API Mode"
              value={apiModeLabel}
              valueColor={apiModeColor}
              showChevron={false}
              {...sharedRowProps}
            />
            <SettingsRow
              icon="server-outline"
              label="Server URL"
              value={SERVER_URL ?? "not set"}
              showChevron={false}
              {...sharedRowProps}
            />
            <SettingsRow
              icon="key-outline"
              label="Auth Token"
              value={token ? "tap to view" : "none"}
              onPress={handleViewToken}
              {...sharedRowProps}
            />
            <SettingsRow
              icon="time-outline"
              label="Token Expires"
              value={tokenExpiry}
              showChevron={false}
              {...sharedRowProps}
            />
            <SettingsRow
              icon="refresh-outline"
              label="Clear Query Cache"
              onPress={handleClearQueryCache}
              {...sharedRowProps}
            />
            <SettingsRow
              icon="trash-outline"
              label="Clear AsyncStorage"
              onPress={handleClearStorage}
              danger
              {...sharedRowProps}
            />
          </View>
        )}

        {/* ── Account ─────────────────────────────────────────── */}
        <SectionHeader label="Account" isDark={isDark} />
        <SettingsRow
          icon="log-out-outline"
          label="Log out"
          onPress={handleLogout}
          danger
          {...sharedRowProps}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
