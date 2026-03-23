import { apiFetch } from "../api";

export type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  total_approved_hours: number;
};

type RequestPinResponse = {
  message: string;
};

type VerifyPinResponse = {
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

/** Request a 6-digit login PIN to be emailed to the user. */
export function requestLoginPin(email: string) {
  return apiFetch<RequestPinResponse>("/login", {
    method: "POST",
    body: { email },
  });
}

/** Verify the emailed PIN. Returns token + user on success. */
export function verifyLoginPin(email: string, pin: string) {
  return apiFetch<VerifyPinResponse>("/login/verify", {
    method: "POST",
    body: { email, pin },
  });
}

/** Exchange a Google ID token for a session token. */
export function googleLogin(idToken: string) {
  return apiFetch<VerifyPinResponse>("/login/google", {
    method: "POST",
    body: { id_token: idToken },
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
