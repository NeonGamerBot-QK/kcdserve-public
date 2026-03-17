import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ThemeStore {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: false,
      setIsDark: (isDark: boolean) => set({ isDark }),
      toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
