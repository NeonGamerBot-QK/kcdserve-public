import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  Alert,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { page1Schema, Page1Values } from "../../lib/schemas/serviceHour";
import { useLogHoursFormStore } from "../../store/logHoursForm";
import { useDashboard } from "../../hooks/useDashboard";
import FilterChip from "../../components/FilterChip";
import { CATEGORIES, COMMON_ORGS } from "../../lib/constants";
import { useTheme } from "../../hooks/useTheme";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function LogHoursPage1() {
  const store = useLogHoursFormStore();
  const { data: dashboard } = useDashboard();
  const { isDark } = useTheme();

  // Date state
  const initialDate = store.page1.serviceDate
    ? new Date(store.page1.serviceDate)
    : new Date();
  const [dateValue, setDateValue] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Org autocomplete state
  const [orgQuery, setOrgQuery] = useState<string>(
    store.page1.organizationName ?? "",
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Location state
  const [locationEnabled, setLocationEnabled] = useState(
    !!store.page1.location,
  );
  const [locationAddress, setLocationAddress] = useState<string | null>(
    store.page1.location ?? null,
  );
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Page1Values>({
    resolver: standardSchemaResolver(page1Schema),
    defaultValues: {
      suborg: store.page1.suborg ?? "",
      hours: store.page1.hours ?? 1,
      minutes: store.page1.minutes ?? 0,
      serviceDate: store.page1.serviceDate ?? toDateString(new Date()),
      organizationName: store.page1.organizationName ?? "",
      category: store.page1.category ?? "",
      description: store.page1.description ?? "",
      location: store.page1.location ?? null,
    },
  });

  const descriptionValue = watch("description") ?? "";
  const selectedCategory = watch("category");

  const orgSuggestions: string[] =
    orgQuery.length >= 2
      ? COMMON_ORGS.filter((o) =>
          o.toLowerCase().includes(orgQuery.toLowerCase()),
        )
      : [];

  const showAddNew =
    orgQuery.length >= 2 &&
    !COMMON_ORGS.some((o) => o.toLowerCase() === orgQuery.toLowerCase());

  async function handleLocationToggle(enabled: boolean) {
    if (!enabled) {
      setLocationEnabled(false);
      setLocationAddress(null);
      setValue("location", null);
      return;
    }

    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Needed",
          "Enable location access in Settings so we can record where you volunteered.",
        );
        setLocationEnabled(false);
        setFetchingLocation(false);
        return;
      }

      setLocationEnabled(true);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const address = place
        ? [place.city, place.region].filter(Boolean).join(", ") ||
          "Unknown location"
        : "Unknown location";

      setLocationAddress(address);
      setValue("location", address);
    } catch {
      Alert.alert("Error", "Could not get your location. Please try again.");
      setLocationEnabled(false);
    } finally {
      setFetchingLocation(false);
    }
  }

  const onNext = handleSubmit((data) => {
    store.setPage1(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/log-hours/verify" as any);
  });

  const groups = dashboard?.groups ?? [];

  const bgPage = isDark ? "bg-slate-950" : "bg-white";
  const bgInput = isDark ? "bg-slate-800" : "bg-slate-50";
  const borderInput = isDark ? "border-slate-700" : "border-slate-200";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textLabel = isDark ? "text-slate-200" : "text-slate-700";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const bgSuggestions = isDark ? "bg-slate-800" : "bg-white";
  const borderSuggestions = isDark ? "border-slate-700" : "border-slate-200";
  const suggestionBorder = isDark ? "border-slate-700" : "border-slate-100";
  const pickerTextColor = isDark ? "#f1f5f9" : "#0f172a";

  return (
    <SafeAreaView className={`flex-1 ${bgPage}`}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-3 border-b ${borderInput}`}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center"
        >
          <Ionicons name="close" size={24} color={isDark ? "#f1f5f9" : "#0f172a"} />
        </Pressable>
        <Text className={`flex-1 text-center font-inter-semibold text-lg ${textPrimary}`}>
          Log Hours
        </Text>
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Suborg */}
          {groups.length > 0 && (
            <>
              <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5`}>
                Sub-organization
              </Text>
              <Controller
                control={control}
                name="suborg"
                render={({ field: { onChange, value } }) => (
                  <View className={`border ${borderInput} rounded-xl ${bgInput} overflow-hidden mb-1`}>
                    <Picker
                      selectedValue={value ?? ""}
                      onValueChange={onChange}
                      style={{ color: pickerTextColor }}
                    >
                      <Picker.Item label="None" value="" />
                      {groups.map((g) => (
                        <Picker.Item key={g.id} label={g.name} value={g.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            </>
          )}

          {/* Hours + Minutes */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Time
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className={`font-inter text-xs ${textMuted} mb-1`}>
                Hours
              </Text>
              <Controller
                control={control}
                name="hours"
                render={({ field: { onChange, value } }) => (
                  <View className={`border ${borderInput} rounded-xl ${bgInput} overflow-hidden`}>
                    <Picker
                      selectedValue={value}
                      onValueChange={(v) => onChange(Number(v))}
                      style={{ color: pickerTextColor }}
                    >
                      {Array.from({ length: 25 }, (_, i) => (
                        <Picker.Item key={i} label={String(i)} value={i} />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            </View>
            <View className="flex-1">
              <Text className={`font-inter text-xs ${textMuted} mb-1`}>
                Minutes
              </Text>
              <Controller
                control={control}
                name="minutes"
                render={({ field: { onChange, value } }) => (
                  <View className={`border ${borderInput} rounded-xl ${bgInput} overflow-hidden`}>
                    <Picker
                      selectedValue={value}
                      onValueChange={(v) => onChange(Number(v))}
                      style={{ color: pickerTextColor }}
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <Picker.Item
                          key={m}
                          label={m === 0 ? "0 min" : `${m} min`}
                          value={m}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            </View>
          </View>
          {(errors.hours || errors.minutes) && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.hours?.message ?? errors.minutes?.message}
            </Text>
          )}

          {/* Service Date */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Service Date
          </Text>
          <Controller
            control={control}
            name="serviceDate"
            render={() => (
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className={`${bgInput} border ${borderInput} rounded-xl px-4 py-3 flex-row items-center justify-between`}
              >
                <Text className={`font-inter text-base ${textPrimary}`}>
                  {formatDate(dateValue)}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#64748b" />
              </Pressable>
            )}
          />
          {errors.serviceDate && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.serviceDate.message}
            </Text>
          )}

          {/* iOS date picker modal */}
          {Platform.OS === "ios" && (
            <Modal visible={showDatePicker} transparent animationType="slide">
              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <View
                  style={{
                    backgroundColor: isDark ? "#1e293b" : "white",
                    paddingBottom: 20,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      paddingHorizontal: 16,
                      paddingTop: 12,
                      paddingBottom: 4,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setValue("serviceDate", toDateString(dateValue));
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={{
                          color: "#22c55e",
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        Done
                      </Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display="spinner"
                    onChange={(_, selected) => {
                      if (selected) setDateValue(selected);
                    }}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Android date picker */}
          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="default"
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  setDateValue(selected);
                  setValue("serviceDate", toDateString(selected));
                }
              }}
            />
          )}

          {/* Organization */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Organization
          </Text>
          <Controller
            control={control}
            name="organizationName"
            render={({ field: { onChange } }) => (
              <View>
                <TextInput
                  className={`${bgInput} border ${borderInput} rounded-xl px-4 py-3 font-inter text-base ${textPrimary}`}
                  placeholder="e.g. Red Cross, Local Food Bank"
                  placeholderTextColor="#94a3b8"
                  value={orgQuery}
                  onChangeText={(text) => {
                    setOrgQuery(text);
                    onChange(text);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions &&
                  (orgSuggestions.length > 0 || showAddNew) && (
                    <View className={`border ${borderSuggestions} rounded-xl mt-1 ${bgSuggestions} overflow-hidden`}>
                      {orgSuggestions.map((org) => (
                        <Pressable
                          key={org}
                          onPress={() => {
                            setOrgQuery(org);
                            onChange(org);
                            setShowSuggestions(false);
                          }}
                          className={`px-4 py-3 border-b ${suggestionBorder}`}
                        >
                          <Text className={`font-inter text-base ${textPrimary}`}>
                            {org}
                          </Text>
                        </Pressable>
                      ))}
                      {showAddNew && (
                        <Pressable
                          onPress={() => {
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-3"
                        >
                          <Text className="font-inter text-base text-primary-500">
                            Add new: "{orgQuery}"
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
              </View>
            )}
          />
          {errors.organizationName && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.organizationName.message}
            </Text>
          )}

          {/* Category */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Category
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange } }) => (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 4 }}
              >
                {CATEGORIES.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={selectedCategory === cat}
                    onPress={() => onChange(cat)}
                  />
                ))}
              </ScrollView>
            )}
          />
          {errors.category && (
            <Text className="text-xs text-red-500 mt-1">
              {errors.category.message}
            </Text>
          )}

          {/* Description */}
          <Text className={`font-inter-medium text-sm ${textLabel} mb-1.5 mt-5`}>
            Description
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`${bgInput} border ${borderInput} rounded-xl px-4 py-3 font-inter text-base ${textPrimary}`}
                placeholder="Describe what you did (at least 10 characters)"
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={{ minHeight: 72 }}
                maxLength={500}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <Text className="text-xs text-slate-400 text-right mt-1">
            {descriptionValue.length}/500
          </Text>
          {errors.description && (
            <Text className="text-xs text-red-500 mt-0.5">
              {errors.description.message}
            </Text>
          )}

          {/* Location */}
          <View className="flex-row items-center justify-between mt-5">
            <View>
              <Text className={`font-inter-medium text-sm ${textLabel}`}>
                Include Location
              </Text>
              {locationEnabled && locationAddress && (
                <Text className={`font-inter text-xs ${textMuted} mt-0.5`}>
                  {locationAddress}
                </Text>
              )}
              {fetchingLocation && (
                <Text className="font-inter text-xs text-slate-400 mt-0.5">
                  Getting location…
                </Text>
              )}
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: "#e2e8f0", true: "#22c55e" }}
              thumbColor="white"
              disabled={fetchingLocation}
            />
          </View>

          {/* Next Button */}
          <Pressable
            className="mt-8 rounded-xl py-3.5 items-center bg-primary-500"
            onPress={onNext}
          >
            <Text className="font-inter-semibold text-base text-white">
              Next
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
