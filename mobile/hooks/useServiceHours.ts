import { useQuery } from "@tanstack/react-query";
import { fetchServiceHours } from "../lib/api/serviceHours";
import { USE_API } from "../lib/config";

/** Query hook for the user's service hours. Only fetches when API is enabled. */
export function useServiceHours() {
  return useQuery({
    queryKey: ["serviceHours"],
    queryFn: fetchServiceHours,
    enabled: USE_API,
  });
}
