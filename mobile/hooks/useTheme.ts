import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";

const THEME_KEY = "kcdserve_theme";

/** Restore persisted preference once on startup, before any component mounts. */
AsyncStorage.getItem(THEME_KEY).then((saved) => {
  if (saved === "dark" || saved === "light") {
    Appearance.setColorScheme(saved);
  } else {
    // Default to dark
    Appearance.setColorScheme("dark");
  }
});

/**
 * Shared dark mode hook. Every instance subscribes to Appearance changes
 * so toggling in one screen updates all screens simultaneously.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(
    () => (Appearance.getColorScheme() ?? "dark") === "dark"
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark((colorScheme ?? "dark") === "dark");
    });
    return () => sub.remove();
  }, []);

  const toggleDarkMode = async () => {
    const next = !isDark;
    Appearance.setColorScheme(next ? "dark" : "light");
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return { isDark, toggleDarkMode };
}
