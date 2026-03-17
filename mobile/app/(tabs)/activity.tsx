import {
  View,
  Text,
  ScrollView,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import FilterChip from "../../components/FilterChip";
import ServiceHourCard from "../../components/ServiceHourCard";
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
  const { data, isLoading, isError } = useServiceHours();
  const { isDark } = useTheme();

  const hours = USE_API ? (data?.service_hours ?? []) : MOCK_HOURS;

  const filtered = useMemo(() => {
    const filterKey = FILTERS[activeFilter].toLowerCase();
    if (filterKey === "all") return hours;
    return hours.filter((h) => h.status === filterKey);
  }, [hours, activeFilter]);

  const sections = useMemo(() => groupByMonth(filtered), [filtered]);

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const textPrimary = isDark ? "text-white" : "text-slate-900";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <TopBar />

      <Text className={`font-inter-semibold text-2xl ${textPrimary} px-5 mt-2 mb-3`}>
        Activity Log
      </Text>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2 mb-4 px-5 max-h-10"
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
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderSectionHeader={({ section: { title } }) => (
          <View className={`px-5 pt-4 pb-1 ${bgPage}`}>
            <Text className="font-inter-semibold text-xs uppercase tracking-wider text-accent-600">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ServiceHourCard
            title={item.title || item.description.slice(0, 40)}
            org={item.group || item.organization_name || item.category || "—"}
            date={formatDate(item.service_date)}
            hours={item.hours}
            status={item.status}
          />
        )}
      />
    </SafeAreaView>
  );
}
