import { apiFetch, apiFormData } from "../api";
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

/**
 * Submit a new service hour entry as multipart/form-data.
 * Photos are appended as file uploads using the React Native file object format.
 */
export function submitServiceHour(data: ServiceHourFormValues) {
  const totalHours = data.hours + data.minutes / 60;
  const formData = new FormData();

  // Scalar fields mapped to the backend's expected keys
  formData.append("service_hour[description]", data.description);
  formData.append("service_hour[service_date]", data.serviceDate);
  formData.append("service_hour[hours]", String(totalHours));
  formData.append("service_hour[organization_name]", data.organizationName);
  formData.append("service_hour[category]", data.category);
  formData.append("service_hour[contact_name]", data.supervisorName);
  formData.append("service_hour[contact_email]", data.supervisorEmail);

  // Optional group ID — only append when truthy
  if (data.suborg) {
    formData.append("service_hour[group_id]", data.suborg);
  }

  // Photo file uploads in the format React Native's fetch expects
  for (const [index, uri] of (data.photos ?? []).entries()) {
    formData.append("service_hour[photos][]", {
      uri,
      type: "image/jpeg",
      name: `photo-${index}.jpg`,
    } as unknown as Blob);
  }

  return apiFormData("/service_hours", formData);
}
