import { apiFetch } from "../api";
import type { ServiceHourFormValues } from "../schemas/serviceHour";

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

/** Submit a new service hour entry. */
export function submitServiceHour(data: ServiceHourFormValues) {
  const totalHours = data.hours + data.minutes / 60;
  return apiFetch("/service_hours", {
    method: "POST",
    body: {
      service_hour: {
        organization_name: data.organizationName,
        service_date: data.serviceDate,
        hours: totalHours,
        description: data.description,
        category: data.category,
        group: data.suborg ?? null,
        location: data.location ?? null,
        supervisor_name: data.supervisorName,
        supervisor_email: data.supervisorEmail,
        signature: data.signature ?? null,
        photos: data.photos ?? [],
      },
    },
  });
}
