export type Role = "admin" | "customer";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  image: string | null;
  provider: "credentials" | "google";
};

export type Session = { user: SessionUser } | null;
