export type Role = "admin" | "customer";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Session = { user: SessionUser } | null;
