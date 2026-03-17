import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "../lib/api/dashboard";
import { USE_API } from "../lib/config";

/** Query hook for dashboard stats. Only fetches when API is enabled. */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: USE_API,
  });
}
