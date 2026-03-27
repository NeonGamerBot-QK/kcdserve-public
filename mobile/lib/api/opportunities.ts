import { apiFetch } from "../api";

/** Shape returned by the Rails API for a single opportunity. */
export type OpportunityResponse = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  category: string | null;
  category_id: number | null;
  max_volunteers: number | null;
  spots_remaining: number | null;
  full: boolean;
  signed_up: boolean;
  required_hours: number | null;
  created_at: string;
};

type OpportunitiesIndexResponse = {
  opportunities: OpportunityResponse[];
  pagy: { page: number; pages: number; count: number };
};

type OpportunitiesParams = {
  category_id?: number;
  q?: string;
  limit?: number;
  page?: number;
};

/**
 * Fetches paginated upcoming opportunities from the API.
 * Supports optional category, search, and pagination filters.
 */
export function fetchOpportunities(params: OpportunitiesParams = {}) {
  const query = new URLSearchParams();
  if (params.category_id) query.set("category_id", String(params.category_id));
  if (params.q) query.set("q", params.q);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.page) query.set("page", String(params.page));

  const qs = query.toString();
  return apiFetch<OpportunitiesIndexResponse>(
    `/opportunities${qs ? `?${qs}` : ""}`,
  );
}

/** Signs up the current user for an opportunity. */
export function signupForOpportunity(opportunityId: number) {
  return apiFetch<{ message: string }>(`/opportunities/${opportunityId}/signup`, {
    method: "POST",
  });
}

/** Withdraws the current user from an opportunity. */
export function withdrawFromOpportunity(opportunityId: number) {
  return apiFetch<{ message: string }>(
    `/opportunities/${opportunityId}/withdraw`,
    { method: "DELETE" },
  );
}
