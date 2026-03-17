import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "../lib/api/auth";

const AUTH_STORAGE_KEY = "kcd-auth";

interface AuthState {
  token: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  /** True once the persisted state has been rehydrated from storage. */
  hydrated: boolean;

  /** Sets auth credentials after a successful login. */
  setAuth: (token: string, expiresAt: string, user: AuthUser) => void;
  /** Clears all auth state (logout or token expiry). */
  logout: () => void;
  /** Returns true if the user has a non-expired token. */
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      hydrated: false,

      setAuth: (token, expiresAt, user) => set({ token, expiresAt, user }),

      logout: () => set({ token: null, expiresAt: null, user: null }),

      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return false;
        return new Date(expiresAt) > new Date();
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    },
  ),
);
