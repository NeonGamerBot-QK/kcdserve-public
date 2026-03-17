import Constants from "expo-constants";

/**
 * Returns the SERVER_URL from Expo env config, or undefined if not set.
 * When undefined + dev mode, the app skips all API calls and uses mock data.
 */
export const SERVER_URL: string | undefined =
  Constants.expoConfig?.extra?.SERVER_URL ??
  process.env.EXPO_PUBLIC_SERVER_URL ??
  undefined;

/** True when running in Expo's __DEV__ mode (local dev server). */
export const IS_DEV = __DEV__;

/**
 * True when the app should use the real API backend.
 * False when there's no SERVER_URL and the app is in dev mode — skips API.
 */
export const USE_API = !!SERVER_URL;
