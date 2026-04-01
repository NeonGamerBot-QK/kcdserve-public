/**
 * Centralized Umami analytics helpers.
 * All tracking calls go through here so callers don't import expo-umami directly.
 */
import {
  initUmami,
  trackScreenView,
  trackEvent,
} from "@bitte-kaufen/expo-umami";

const WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID ?? "";
const HOST_URL =
  process.env.EXPO_PUBLIC_UMAMI_HOST_URL ?? "https://cloud.umami.is";

/**
 * Initialize Umami. Call once from the root layout before any tracking.
 * No-ops if EXPO_PUBLIC_UMAMI_WEBSITE_ID is not set.
 */
export function initAnalytics() {
  if (!WEBSITE_ID) return;

  initUmami({
    websiteId: WEBSITE_ID,
    hostUrl: HOST_URL,
    batchSize: 10,
    batchInterval: 30_000,
    persistEvents: true,
    debug: __DEV__,
  });
}

/** Track a screen view. Called automatically by ScreenTracker in the root layout. */
export function trackScreen(pathname: string) {
  if (!WEBSITE_ID) return;
  trackScreenView(pathname);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** User tapped a sign-in button. */
export function trackLoginAttempt(method: "email" | "google") {
  trackEvent("/auth/login", {
    title: "Login Attempt",
    data: { method },
  });
}

/** User successfully authenticated. */
export function trackLoginSuccess(method: "email" | "google") {
  trackEvent("/auth/login", {
    title: "Login Success",
    data: { method },
  });
}

/** Authentication failed. */
export function trackLoginFailed(method: "email" | "google", reason?: string) {
  trackEvent("/auth/login", {
    title: "Login Failed",
    data: { method, reason },
  });
}

/** User logged out. */
export function trackLogout() {
  trackEvent("/settings/account", {
    title: "Logout",
  });
}

// ── Log Hours ─────────────────────────────────────────────────────────────────

/**
 * Step 1 submitted — org, category, hours, and date selected.
 * @param hours - number of hours logged
 * @param hasLocation - whether location was included
 */
export function trackLogHoursStep1Completed(
  hours: number,
  hasLocation: boolean,
) {
  trackEvent("/log-hours/step-1", {
    title: "Log Hours Step 1 Completed",
    data: { hours, has_location: hasLocation },
  });
}

/** Photo attached to a service hour submission. */
export function trackPhotoAdded(source: "camera" | "library") {
  trackEvent("/log-hours/step-2", {
    title: "Photo Added",
    data: { source },
  });
}

/** Photo removed from a service hour submission. */
export function trackPhotoRemoved() {
  trackEvent("/log-hours/step-2", {
    title: "Photo Removed",
  });
}

/** Supervisor signature captured. */
export function trackSignatureCaptured() {
  trackEvent("/log-hours/step-2", {
    title: "Signature Captured",
  });
}

/** Submit button pressed. */
export function trackHoursSubmitAttempt() {
  trackEvent("/log-hours/step-2", {
    title: "Submit Attempt",
  });
}

/** Service hours submitted successfully. */
export function trackHoursSubmitSuccess(hours: number) {
  trackEvent("/log-hours/step-2", {
    title: "Submit Success",
    data: { hours },
  });
}

/** Service hours submission failed. */
export function trackHoursSubmitFailed(reason: string) {
  trackEvent("/log-hours/step-2", {
    title: "Submit Failed",
    data: { reason },
  });
}
