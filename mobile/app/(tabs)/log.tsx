import { useEffect } from "react";
import { router } from "expo-router";

/**
 * This screen is never actually rendered — the tab's `tabPress` listener
 * in `_layout.tsx` intercepts navigation and redirects to `/log-hours`.
 * This file exists only to satisfy Expo Router's file-based routing.
 */
export default function LogScreen() {
  useEffect(() => {
    router.replace("/log-hours" as never);
  }, []);

  return null;
}
