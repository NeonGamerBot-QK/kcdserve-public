import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitServiceHour } from "../lib/api/serviceHours";

export function useSubmitServiceHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitServiceHour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceHours"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
