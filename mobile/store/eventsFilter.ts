import { create } from "zustand";

export type DateFilter =
  | "any"
  | "today"
  | "this_week"
  | "this_month"
  | "custom";
export type DistanceFilter = "any" | "5" | "10" | "25";

interface EventsFilterState {
  categories: string[];
  dateFilter: DateFilter;
  customDateStart: string | null;
  customDateEnd: string | null;
  suborgs: string[];
  distance: DistanceFilter;

  setCategories: (v: string[]) => void;
  setDateFilter: (v: DateFilter) => void;
  setCustomDateRange: (start: string | null, end: string | null) => void;
  setSuborgs: (v: string[]) => void;
  setDistance: (v: DistanceFilter) => void;
  clearAll: () => void;
}

export const useEventsFilterStore = create<EventsFilterState>((set) => ({
  categories: [],
  dateFilter: "any",
  customDateStart: null,
  customDateEnd: null,
  suborgs: [],
  distance: "any",

  setCategories: (v) => set({ categories: v }),
  setDateFilter: (v) => set({ dateFilter: v }),
  setCustomDateRange: (start, end) =>
    set({ customDateStart: start, customDateEnd: end }),
  setSuborgs: (v) => set({ suborgs: v }),
  setDistance: (v) => set({ distance: v }),
  clearAll: () =>
    set({
      categories: [],
      dateFilter: "any",
      customDateStart: null,
      customDateEnd: null,
      suborgs: [],
      distance: "any",
    }),
}));
