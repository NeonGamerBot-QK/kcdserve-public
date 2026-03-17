import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";

const THEME_KEY = "kcdserve_theme";

// Default to dark while we sort out NativeWind's cache issue
const DEFAULT_DARK = true;

export function useTheme() {
  const [isDark, setIsDark] = useState(DEFAULT_DARK);

  // Apply color scheme to React Native Appearance (NativeWind reads from this)
  const applyScheme = (dark: boolean) => {
    Appearance.setColorScheme(dark ? "dark" : "light");
    setIsDark(dark);
  };

  // On mount, set default + restore persisted preference
  useEffect(() => {
    applyScheme(DEFAULT_DARK);
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") {
        applyScheme(saved === "dark");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDark;
    applyScheme(next);
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return { isDark, toggleDarkMode };
}
