import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../lib/api/categories";
import { CATEGORIES } from "../lib/constants";
import { USE_API } from "../lib/config";

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: USE_API,
    staleTime: 1000 * 60 * 10, // categories rarely change
  });

  const categories = USE_API
    ? (data?.categories.map((c) => c.name) ?? [])
    : CATEGORIES;

  return { categories, isLoading: USE_API && isLoading };
}
