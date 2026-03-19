import { apiFetch } from "../api";

export type Category = {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
};

type CategoriesResponse = {
  categories: Category[];
};

export function fetchCategories() {
  return apiFetch<CategoriesResponse>("/categories");
}
