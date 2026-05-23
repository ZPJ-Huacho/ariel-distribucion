import { create } from "zustand";
import type { AuthUser } from "@mercabana/core";

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setHydrated: (user: AuthUser | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  setHydrated: (user) => set({ user, hydrated: true }),
}));

export type { AuthUser };
