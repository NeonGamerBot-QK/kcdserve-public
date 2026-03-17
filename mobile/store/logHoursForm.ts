import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Page1Values, Page2Values } from "../lib/schemas/serviceHour";

interface LogHoursFormState {
  page1: Partial<Page1Values>;
  page2: Partial<Page2Values>;
  setPage1: (v: Partial<Page1Values>) => void;
  setPage2: (v: Partial<Page2Values>) => void;
  reset: () => void;
}

export const useLogHoursFormStore = create<LogHoursFormState>()(
  persist(
    (set) => ({
      page1: {},
      page2: {},
      setPage1: (v) => set({ page1: v }),
      setPage2: (v) => set({ page2: v }),
      reset: () => set({ page1: {}, page2: {} }),
    }),
    {
      name: "kcd-log-hours-form",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
