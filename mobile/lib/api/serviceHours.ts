import { apiFetch } from "../api";

export type ServiceHourEntry = {
  id: number;
  title: string | null;
  description: string;
  organization_name: string | null;
  hours: number;
  status: "pending" | "approved" | "rejected";
  service_date: string;
  category: string | null;
  group: string | null;
  created_at: string;
};

type ServiceHoursResponse = {
  service_hours: ServiceHourEntry[];
};

/** Fetch all service hours for the current user. */
export function fetchServiceHours() {
  return apiFetch<ServiceHoursResponse>("/service_hours");
}
