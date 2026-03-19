import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";

const THEME_KEY = "kcdserve_theme";

interface ThemeState {
  isDark: boolean;
  _setIsDark: (v: boolean) => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  _setIsDark: (v) => set({ isDark: v }),
}));

/** Called once in _layout.tsx to restore persisted preference. */
export async function initTheme() {
  const saved = await AsyncStorage.getItem(THEME_KEY);
  const isDark = saved === "light" ? false : true; // default dark
  useThemeStore.getState()._setIsDark(isDark);
  Appearance.setColorScheme(isDark ? "dark" : "light");
}

export function useTheme() {
  const isDark = useThemeStore((s) => s.isDark);

  const toggleDarkMode = async () => {
    const next = !isDark;
    useThemeStore.getState()._setIsDark(next);
    Appearance.setColorScheme(next ? "dark" : "light");
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return { isDark, toggleDarkMode };
}
