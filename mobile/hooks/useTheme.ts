import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { useThemeStore } from "../store/theme";

export function useTheme() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { isDark, setIsDark, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    // Initialize dark mode based on system preference if no user preference exists
    if (colorScheme && !useThemeStore.getState().isDark) {
      setIsDark(colorScheme === "dark");
    }
  }, [colorScheme, setIsDark]);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    toggleColorScheme?.();
  };

  return {
    isDark,
    colorScheme,
    toggleDarkMode: handleToggleDarkMode,
  };
}
