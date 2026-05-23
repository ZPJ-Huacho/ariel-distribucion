import { create } from "zustand";

export type AuthUser = {
  email: string;
  name: string;
  role: "admin" | "customer";
  phone?: string;
};

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

export const AUTH_STORAGE_KEY = "fdm-auth";

// Demo credentials — usuario admin del cliente Mercabarna
export const ADMIN_CREDENTIALS = {
  email: "admin@frutas.com",
  password: "admin123",
  name: "Frutas del Mercat",
  role: "admin" as const,
};

type DemoCustomer = AuthUser & { password: string };

const STORAGE_USERS_KEY = "fdm-users";

function loadUsers(): DemoCustomer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? (JSON.parse(raw) as DemoCustomer[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: DemoCustomer[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export function tryLogin(email: string, password: string): LoginResult {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return {
      ok: true,
      user: {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
      },
    };
  }
  const users = loadUsers();
  const match = users.find((u) => u.email === cleanEmail && u.password === password);
  if (match) {
    return {
      ok: true,
      user: { email: match.email, name: match.name, role: match.role, phone: match.phone },
    };
  }
  return { ok: false, error: "Email o contraseña incorrectos." };
}

export type RegisterResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export function tryRegister(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): RegisterResult {
  const cleanEmail = input.email.trim().toLowerCase();
  if (cleanEmail === ADMIN_CREDENTIALS.email) {
    return { ok: false, error: "Ese email ya está en uso." };
  }
  const users = loadUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { ok: false, error: "Ya existe una cuenta con ese email." };
  }
  const newUser: DemoCustomer = {
    email: cleanEmail,
    password: input.password,
    name: input.name.trim(),
    role: "customer",
    phone: input.phone?.trim(),
  };
  saveUsers([...users, newUser]);
  return {
    ok: true,
    user: { email: newUser.email, name: newUser.name, role: "customer", phone: newUser.phone },
  };
}
