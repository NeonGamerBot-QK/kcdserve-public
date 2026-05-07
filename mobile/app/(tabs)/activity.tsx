import {
  View,
  Text,
  ScrollView,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import TopBar from "../../components/TopBar";
import FilterChip from "../../components/FilterChip";
import ServiceHourCard from "../../components/ServiceHourCard";
import StatusBadge from "../../components/StatusBadge";
import { USE_API } from "../../lib/config";
import { useServiceHours } from "../../hooks/useServiceHours";
import { useTheme } from "../../hooks/useTheme";
import type { ServiceHourEntry } from "../../lib/api/serviceHours";

// Fallback mock data for dev mode without SERVER_URL
const MOCK_HOURS: ServiceHourEntry[] = [
  {
    id: 1,
    title: "Food Bank Volunteering",
    description: "",
    organization_name: "NHS",
    hours: 3,
    status: "approved",
    service_date: "2023-10-15",
    category: null,
    group: "NHS",
    admin_comment: null,
    created_at: "2023-10-15T00:00:00Z",
  },
  {
    id: 2,
    title: "Park Cleanup",
    description: "",
    organization_name: "Key Club",
    hours: 2.5,
    status: "pending",
    service_date: "2023-10-12",
    category: null,
    group: "Key Club",
    admin_comment: null,
    created_at: "2023-10-12T00:00:00Z",
  },
  {
    id: 3,
    title: "Tutoring Session",
    description: "",
    organization_name: "NHS",
    hours: 1.5,
    status: "approved",
    service_date: "2023-10-08",
    category: null,
    group: "NHS",
    admin_comment: null,
    created_at: "2023-10-08T00:00:00Z",
  },
  {
    id: 4,
    title: "Welcome Week Setup",
    description: "",
    organization_name: "Student Council",
    hours: 4,
    status: "approved",
    service_date: "2023-09-28",
    category: null,
    group: "Student Council",
    admin_comment: null,
    created_at: "2023-09-28T00:00:00Z",
  },
  {
    id: 5,
    title: "Library Organization",
    description: "",
    organization_name: "NHS",
    hours: 2,
    status: "rejected",
    service_date: "2023-09-15",
    category: null,
    group: "NHS",
    admin_comment:
      "Missing supervisor verification. Please resubmit with a valid signature.",
    created_at: "2023-09-15T00:00:00Z",
  },
];

const FILTERS = ["All", "Approved", "Pending", "Rejected"];

/** Groups service hours by month/year for SectionList display. */
function groupByMonth(hours: ServiceHourEntry[]) {
  const map = new Map<string, ServiceHourEntry[]>();
  for (const h of hours) {
    const date = new Date(h.service_date);
    const key = date
      .toLocaleDateString("en-US", { month: "long", year: "numeric" })
      .toUpperCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(h);
  }
  return Array.from(map, ([title, data]) => ({ title, data }));
}

/** Formats an ISO date string to a short display like "Oct 15". */
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const { data, isLoading, isError, refetch, isRefetching } = useServiceHours();
  const { isDark } = useTheme();

  const hours = USE_API ? (data?.service_hours ?? []) : MOCK_HOURS;

  const filtered = useMemo(() => {
    const filterKey = FILTERS[activeFilter].toLowerCase();
    if (filterKey === "all") return hours;
    return hours.filter((h) => h.status === filterKey);
  }, [hours, activeFilter]);

  const sections = useMemo(() => groupByMonth(filtered), [filtered]);

  const [selectedEntry, setSelectedEntry] = useState<ServiceHourEntry | null>(
    null,
  );
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openDetail = useCallback((entry: ServiceHourEntry) => {
    setSelectedEntry(entry);
    bottomSheetRef.current?.expand();
  }, []);

  const closeDetail = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) setSelectedEntry(null);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const bgSheet = isDark ? "#1e293b" : "#ffffff";
  const handleColor = isDark ? "#334155" : "#cbd5e1";

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 ${bgPage}`}>
      <TopBar />

      <Text
        className={`font-inter-semibold text-2xl ${textPrimary} px-5 mt-2 mb-3`}
      >
        Activity Log
      </Text>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2 mb-4 px-5 flex-shrink-0 flex-grow-0"
        contentContainerStyle={{ paddingRight: 20, alignItems: "center" }}
      >
        {FILTERS.map((label, i) => (
          <FilterChip
            key={label}
            label={label}
            active={i === activeFilter}
            onPress={() => setActiveFilter(i)}
          />
        ))}
      </ScrollView>

      {USE_API && isLoading && (
        <View className="items-center mt-10">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {USE_API && isError && (
        <View className="items-center mt-10 px-5">
          <Text className="font-inter text-base text-red-500 text-center">
            Failed to load activity. Pull down to retry.
          </Text>
        </View>
      )}

      {!isLoading && sections.length === 0 && (
        <View className="items-center mt-10 px-5">
          <Text className="font-inter text-base text-slate-400 text-center">
            No service hours to show.
          </Text>
        </View>
      )}

      <SectionList
        className="flex-1"
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderSectionHeader={({ section: { title } }) => (
          <View className={`px-5 pt-4 pb-1 ${bgPage}`}>
            <Text className="font-inter-semibold text-xs uppercase tracking-wider text-accent-600">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ServiceHourCard
            title={
              item.organization_name ||
              item.title ||
              item.description.slice(0, 20)
            }
            org={item.group || item.organization_name || item.category || "—"}
            date={formatDate(item.service_date)}
            hours={item.hours}
            status={item.status}
            onPress={() => openDetail(item)}
          />
        )}
      />

      {/* Detail Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: bgSheet, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: handleColor, width: 40 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          {selectedEntry && (
            <>
              {/* Header row */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1 mr-3">
                  <Text
                    className={`font-inter-semibold text-xl ${textPrimary}`}
                  >
                    {selectedEntry.organization_name ||
                      selectedEntry.title ||
                      "Service Hours"}
                  </Text>
                  {selectedEntry.group && (
                    <Text
                      className={`font-inter text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {selectedEntry.group}
                    </Text>
                  )}
                </View>
                <StatusBadge status={selectedEntry.status} />
              </View>

              {/* Detail rows */}
              <View className="gap-3">
                <DetailRow
                  icon="calendar-outline"
                  label="Date"
                  value={new Date(
                    selectedEntry.service_date,
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  isDark={isDark}
                />
                <DetailRow
                  icon="time-outline"
                  label="Hours"
                  value={`${selectedEntry.hours}h`}
                  isDark={isDark}
                />
                {selectedEntry.category && (
                  <DetailRow
                    icon="pricetag-outline"
                    label="Category"
                    value={selectedEntry.category}
                    isDark={isDark}
                  />
                )}
                {selectedEntry.description ? (
                  <DetailRow
                    icon="document-text-outline"
                    label="Description"
                    value={selectedEntry.description}
                    isDark={isDark}
                  />
                ) : null}
                {selectedEntry.admin_comment ? (
                  <View
                    className={`rounded-xl p-3 ${
                      selectedEntry.status === "rejected"
                        ? isDark
                          ? "bg-red-950"
                          : "bg-red-50"
                        : isDark
                          ? "bg-slate-800"
                          : "bg-slate-100"
                    }`}
                  >
                    <DetailRow
                      icon={
                        selectedEntry.status === "rejected"
                          ? "close-circle-outline"
                          : "chatbubble-outline"
                      }
                      label={
                        selectedEntry.status === "rejected"
                          ? "Rejection Reason"
                          : "Admin Comment"
                      }
                      value={selectedEntry.admin_comment}
                      isDark={isDark}
                    />
                  </View>
                ) : null}
                <DetailRow
                  icon="add-circle-outline"
                  label="Submitted"
                  value={new Date(selectedEntry.created_at).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                  isDark={isDark}
                />
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

/** A single row in the detail modal showing an icon, label, and value. */
function DetailRow({
  icon,
  label,
  value,
  isDark,
}: {
  icon: string;
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <View className="flex-row items-start">
      <Ionicons
        name={icon as any}
        size={18}
        color={isDark ? "#94a3b8" : "#64748b"}
        style={{ marginTop: 2, marginRight: 10, width: 20 }}
      />
      <View className="flex-1">
        <Text
          className={`font-inter text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          {label}
        </Text>
        <Text
          className={`font-inter-medium text-sm mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
