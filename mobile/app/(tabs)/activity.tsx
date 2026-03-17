import { View, Text, ScrollView, SectionList } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "../../components/TopBar";
import FilterChip from "../../components/FilterChip";
import ServiceHourCard from "../../components/ServiceHourCard";

const FILTERS = ["All Organizations", "NHS", "Key Club", "Approved"];

type ActivityItem = {
  id: string;
  title: string;
  org: string;
  date: string;
  hours: number;
  status: "pending" | "approved" | "rejected";
  icon: string;
};

const SECTIONS: { title: string; data: ActivityItem[] }[] = [
  {
    title: "OCTOBER 2023",
    data: [
      {
        id: "1",
        title: "Food Bank Volunteering",
        org: "NHS",
        date: "Oct 15",
        hours: 3,
        status: "approved" as const,
        icon: "heart-outline" as const,
      },
      {
        id: "2",
        title: "Park Cleanup",
        org: "Key Club",
        date: "Oct 12",
        hours: 2.5,
        status: "pending" as const,
        icon: "leaf-outline" as const,
      },
      {
        id: "3",
        title: "Tutoring Session",
        org: "NHS",
        date: "Oct 8",
        hours: 1.5,
        status: "approved" as const,
        icon: "book-outline" as const,
      },
    ],
  },
  {
    title: "SEPTEMBER 2023",
    data: [
      {
        id: "4",
        title: "Welcome Week Setup",
        org: "Student Council",
        date: "Sep 28",
        hours: 4,
        status: "approved" as const,
        icon: "people-outline" as const,
      },
      {
        id: "5",
        title: "Library Organization",
        org: "NHS",
        date: "Sep 15",
        hours: 2,
        status: "rejected" as const,
        icon: "library-outline" as const,
      },
    ],
  },
];

export default function ActivityScreen() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <TopBar initial="J" />

      <Text className="font-inter-semibold text-2xl text-slate-900 px-5 mt-2 mb-3">
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

      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-5 pt-4 pb-1 bg-slate-50">
            <Text className="font-inter-semibold text-xs uppercase tracking-wider text-accent-600">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ServiceHourCard
            title={item.title}
            org={item.org}
            date={item.date}
            hours={item.hours}
            status={item.status}
            icon={item.icon}
          />
        )}
      />
    </SafeAreaView>
  );
}
