import { apiFetch } from "../api";

export type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  total_approved_hours: number;
};

type LoginResponse = {
  token: string;
  expires_at: string;
  user: AuthUser;
};

type MeResponse = {
  user: AuthUser & {
    phone: string | null;
    bio: string | null;
    birthday: string | null;
  };
};

/** Authenticate with email + password. Returns token + user. */
export function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/login", {
    method: "POST",
    body: { email, password },
  });
}

/** Invalidate the current API token on the server. */
export function logout() {
  return apiFetch<{ message: string }>("/logout", { method: "DELETE" });
}

/** Fetch the currently authenticated user's profile. */
export function fetchMe() {
  return apiFetch<MeResponse>("/me");
}
