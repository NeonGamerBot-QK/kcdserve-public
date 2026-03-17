import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

const THEME_KEY = "kcdserve_theme";

export function useTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // On mount, restore persisted preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") {
        setColorScheme(saved);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  return { isDark, toggleDarkMode };
}
