"use client";

import { createContext, useContext } from "react";

export type ClientUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
} | null;

const UserCtx = createContext<ClientUser>(null);

export function UserProvider({
  user,
  children,
}: {
  user: ClientUser;
  children: React.ReactNode;
}) {
  return <UserCtx.Provider value={user}>{children}</UserCtx.Provider>;
}

export function useCurrentUser(): ClientUser {
  return useContext(UserCtx);
}
