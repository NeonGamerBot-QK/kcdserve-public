import { apiFetch } from "../api";

export type DashboardGroup = {
  id: number;
  name: string;
  current_hours: number;
  total_approved_hours: number;
};

export type DashboardData = {
  approved_hours: number;
  pending_hours: number;
  groups: DashboardGroup[];
};

/** Fetch dashboard stats for the current user. */
export function fetchDashboard() {
  return apiFetch<DashboardData>("/dashboard");
}
