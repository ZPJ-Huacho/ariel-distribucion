"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/core/settings";

const SettingsCtx = createContext<Settings | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Settings;
  children: React.ReactNode;
}) {
  return <SettingsCtx.Provider value={settings}>{children}</SettingsCtx.Provider>;
}

export function useSettings(): Settings {
  const s = useContext(SettingsCtx);
  if (!s) throw new Error("useSettings must be inside SettingsProvider");
  return s;
}
