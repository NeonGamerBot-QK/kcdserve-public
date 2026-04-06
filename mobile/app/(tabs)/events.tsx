import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventCard from "../../components/EventCard";
import PillChip from "../../components/PillChip";
import TopBar from "../../components/TopBar";
import { useEvents, useToggleSignup, type Event } from "../../hooks/useEvents";
import { useTheme } from "../../hooks/useTheme";
import {
  useEventsFilterStore,
  type DateFilter,
  type DistanceFilter,
} from "../../store/eventsFilter";

// ─── Filter option constants ─────────────────────────────────────────────────

const DATE_OPTIONS: { label: string; value: DateFilter }[] = [
  { label: "Any", value: "any" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom", value: "custom" },
];

const DISTANCE_OPTIONS: { label: string; value: DistanceFilter }[] = [
  { label: "Any", value: "any" },
  { label: "5 miles", value: "5" },
  { label: "10 miles", value: "10" },
  { label: "25 miles", value: "25" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isInDateRange(
  iso: string,
  filter: DateFilter,
  start: string | null,
  end: string | null,
): boolean {
  if (filter === "any") return true;
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === "today") {
    return d >= startOfDay && d < new Date(startOfDay.getTime() + 86400000);
  }
  if (filter === "this_week") {
    const weekEnd = new Date(startOfDay.getTime() + 7 * 86400000);
    return d >= startOfDay && d < weekEnd;
  }
  if (filter === "this_month") {
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }
  if (filter === "custom" && start && end) {
    // Set end to 23:59:59 so events on the end date itself are included.
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    return d >= new Date(start) && d <= endDate;
  }
  return true;
}

function toggleMulti(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EventsScreen() {
  const { isDark } = useTheme();
  const { data, isLoading, refetch, isRefetching } = useEvents();
  const allEvents = data ?? [];
  const toggleSignup = useToggleSignup();

  // Derive categories dynamically from actual event data
  const allCategories = useMemo(
    () => [...new Set(allEvents.map((e) => e.category))],
    [allEvents],
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "my_events">(
    "upcoming",
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const {
    categories: filterCategories,
    dateFilter,
    customDateStart,
    customDateEnd,
    distance,
    setCategories,
    setDateFilter,
    setCustomDateRange,
    setDistance,
    clearAll,
  } = useEventsFilterStore();

  const hasActiveFilters =
    filterCategories.length > 0 || dateFilter !== "any" || distance !== "any";

  const filteredEvents = useMemo(() => {
    let result = allEvents;

    if (activeTab === "my_events") {
      result = result.filter((e) => e.isSignedUp);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organization.toLowerCase().includes(q),
      );
    }

    if (filterCategories.length > 0) {
      result = result.filter((e) => filterCategories.includes(e.category));
    }

    result = result.filter((e) =>
      isInDateRange(e.date, dateFilter, customDateStart, customDateEnd),
    );

    // TODO: apply distance filter once the API returns event coordinates.
    // Currently `distance` is stored but events only have a string address,
    // so radius filtering requires geocoding.

    return result;
  }, [
    allEvents,
    activeTab,
    search,
    filterCategories,
    dateFilter,
    customDateStart,
    customDateEnd,
    distance,
  ]);

  const handleToggleSignUp = useCallback(
    (id: number) => {
      const event = allEvents.find((e) => e.id === id);
      if (!event) return;
      toggleSignup.mutate({ id, isSignedUp: event.isSignedUp });
    },
    [allEvents, toggleSignup],
  );

  const openFilters = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeFilters = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const bgPage = isDark ? "bg-slate-950" : "bg-slate-50";
  const bgSheet = isDark ? "#0f172a" : "#ffffff";
  const handleColor = isDark ? "#334155" : "#cbd5e1";

  // ── List header: search + chips + tabs + results label ──
  const ListHeader = (
    <View className="pt-2 pb-1">
      {/* Search bar + Filters button */}
      <View className="mx-5 mb-4 flex-row items-center" style={{ gap: 8 }}>
        <View
          className={`flex-1 flex-row items-center rounded-full px-4 py-3 ${
            isDark ? "bg-slate-800" : "bg-slate-100"
          }`}
        >
          <Ionicons
            name="search-outline"
            size={17}
            color="#94a3b8"
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search events..."
            placeholderTextColor="#94a3b8"
            className={`flex-1 font-inter text-sm ${isDark ? "text-white" : "text-slate-900"}`}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Filters button */}
        <View className="relative">
          <Pressable
            onPress={openFilters}
            className={`flex-row items-center px-3 py-2 rounded-full border ${
              isDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <Text
              className={`font-inter-medium text-sm ml-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Filters
            </Text>
          </Pressable>
          {hasActiveFilters && (
            <View className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
          )}
        </View>
      </View>

      {/* Tab switcher */}
      <View
        className={`flex-row mx-5 mb-3 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}
      >
        {(["upcoming", "my_events"] as const).map((tab) => {
          const label = tab === "upcoming" ? "Upcoming" : "My Events";
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-6 pb-2 border-b-2 ${
                isActive ? "border-accent-500" : "border-transparent"
              }`}
            >
              <Text
                className={`font-inter-semibold text-sm ${
                  isActive
                    ? "text-accent-500"
                    : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results label */}
      <Text className="font-inter text-xs text-slate-400 px-5 mb-2">
        {activeTab === "upcoming" ? "Upcoming" : "My Events"} (
        {filteredEvents.length})
      </Text>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      <TopBar />

      <Text
        className={`font-inter-semibold text-2xl ${
          isDark ? "text-white" : "text-slate-900"
        } px-5 mt-2 mb-3`}
      >
        Events
      </Text>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onToggleSignUp={handleToggleSignUp}
            onPress={() => setSelectedEvent(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center mt-10">
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : (
            <View className="items-center mt-10 px-5">
              <Text className="font-inter text-base text-slate-400 text-center">
                No events match your filters.
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
      />

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["60%", "90%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: bgSheet }}
        handleIndicatorStyle={{ backgroundColor: handleColor }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Sheet header */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text
              className={`font-inter-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Filters
            </Text>
            <Pressable onPress={clearAll}>
              <Text className="font-inter-medium text-sm text-accent-500">
                Clear All
              </Text>
            </Pressable>
          </View>

          {/* Category */}
          <View className="px-5 mb-5">
            <Text
              className={`font-inter-semibold text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Category
            </Text>
            <View className="flex-row flex-wrap">
              {allCategories.map((cat) => (
                <PillChip
                  key={cat}
                  label={cat}
                  active={filterCategories.includes(cat)}
                  onPress={() =>
                    setCategories(toggleMulti(filterCategories, cat))
                  }
                />
              ))}
            </View>
          </View>

          {/* Date */}
          <View className="px-5 mb-5">
            <Text
              className={`font-inter-semibold text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Date
            </Text>
            <View className="flex-row flex-wrap">
              {DATE_OPTIONS.map((opt) => (
                <PillChip
                  key={opt.value}
                  label={opt.label}
                  active={dateFilter === opt.value}
                  onPress={() => setDateFilter(opt.value)}
                />
              ))}
            </View>

            {dateFilter === "custom" && (
              <View className="mt-2">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <Pressable
                    onPress={() => setShowStartPicker(true)}
                    className={`flex-1 rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`font-inter text-sm ${
                        customDateStart
                          ? isDark
                            ? "text-white"
                            : "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {customDateStart
                        ? formatDate(customDateStart)
                        : "Start date"}
                    </Text>
                  </Pressable>
                  <Text
                    className={`font-inter text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    to
                  </Text>
                  <Pressable
                    onPress={() => setShowEndPicker(true)}
                    className={`flex-1 rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Text
                      className={`font-inter text-sm ${
                        customDateEnd
                          ? isDark
                            ? "text-white"
                            : "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {customDateEnd ? formatDate(customDateEnd) : "End date"}
                    </Text>
                  </Pressable>
                </View>

                {showStartPicker && (
                  <DateTimePicker
                    mode="date"
                    value={
                      customDateStart ? new Date(customDateStart) : new Date()
                    }
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, d) => {
                      setShowStartPicker(false);
                      if (d)
                        setCustomDateRange(
                          d.toISOString().slice(0, 10),
                          customDateEnd,
                        );
                    }}
                  />
                )}
                {showEndPicker && (
                  <DateTimePicker
                    mode="date"
                    value={customDateEnd ? new Date(customDateEnd) : new Date()}
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, d) => {
                      setShowEndPicker(false);
                      if (d)
                        setCustomDateRange(
                          customDateStart,
                          d.toISOString().slice(0, 10),
                        );
                    }}
                  />
                )}
              </View>
            )}
          </View>

          {/* Distance */}
          <View className="px-5 mb-5">
            <Text
              className={`font-inter-semibold text-sm mb-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Distance
            </Text>
            <View className="flex-row flex-wrap">
              {DISTANCE_OPTIONS.map((opt) => (
                <PillChip
                  key={opt.value}
                  label={opt.label}
                  active={distance === opt.value}
                  onPress={() => setDistance(opt.value)}
                />
              ))}
            </View>
          </View>
        </BottomSheetScrollView>

        {/* Sticky Show Results button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 32,
            paddingTop: 12,
            backgroundColor: bgSheet,
          }}
        >
          <Pressable
            onPress={closeFilters}
            className="bg-accent-500 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-inter-semibold text-base">
              Show Results ({filteredEvents.length})
            </Text>
          </Pressable>
          <View className="h-20" />
        </View>
      </BottomSheet>

      {/* Event Detail Modal */}
      <Modal
        visible={selectedEvent !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEvent(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setSelectedEvent(null)}
        >
          <Pressable
            className={`rounded-t-3xl px-6 pt-5 pb-10 ${isDark ? "bg-slate-900" : "bg-white"}`}
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View className="self-center w-10 h-1 rounded-full bg-slate-400 mb-5" />

            {selectedEvent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Category + date */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="bg-accent-500 rounded-full px-3 py-1">
                    <Text className="text-white font-inter-medium text-xs">
                      {selectedEvent.category}
                    </Text>
                  </View>
                  <Text
                    className={`font-inter text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  className={`font-inter-semibold text-xl mb-1 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {selectedEvent.title}
                </Text>

                {/* Org */}
                <Text
                  className={`font-inter text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {selectedEvent.organization}
                </Text>

                {/* Detail rows */}
                <View className="gap-3">
                  <EventDetailRow
                    icon="location-outline"
                    label="Location"
                    value={selectedEvent.location || "Not specified"}
                    isDark={isDark}
                  />
                  {(selectedEvent.startTime || selectedEvent.endTime) && (
                    <EventDetailRow
                      icon="time-outline"
                      label="Time"
                      value={
                        [selectedEvent.startTime, selectedEvent.endTime]
                          .filter(Boolean)
                          .join(" – ") || "Not specified"
                      }
                      isDark={isDark}
                    />
                  )}
                  {selectedEvent.maxVolunteers !== null && (
                    <EventDetailRow
                      icon="people-outline"
                      label="Volunteers"
                      value={
                        selectedEvent.spotsRemaining !== null
                          ? `${selectedEvent.spotsRemaining} spots remaining (max ${selectedEvent.maxVolunteers})`
                          : `Max ${selectedEvent.maxVolunteers}`
                      }
                      isDark={isDark}
                    />
                  )}
                  {selectedEvent.description && (
                    <EventDetailRow
                      icon="document-text-outline"
                      label="Description"
                      value={selectedEvent.description}
                      isDark={isDark}
                    />
                  )}
                </View>

                {/* Sign Up / Signed Up button */}
                <Pressable
                  onPress={() => {
                    handleToggleSignUp(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className={`mt-6 rounded-xl py-3.5 items-center ${
                    selectedEvent.isSignedUp
                      ? "border border-accent-500 bg-transparent"
                      : "bg-accent-500"
                  }`}
                >
                  <Text
                    className={`font-inter-semibold text-base ${
                      selectedEvent.isSignedUp ? "text-accent-500" : "text-white"
                    }`}
                  >
                    {selectedEvent.isSignedUp ? "Withdraw" : "Sign Up"}
                  </Text>
                </Pressable>

                {/* Close */}
                <Pressable
                  onPress={() => setSelectedEvent(null)}
                  className={`mt-3 rounded-xl py-3.5 items-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  <Text
                    className={`font-inter-semibold text-base ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    Close
                  </Text>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/** A single row in the event detail modal. */
function EventDetailRow({
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
