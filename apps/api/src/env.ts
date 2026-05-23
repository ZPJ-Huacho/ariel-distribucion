import type { Tenant, User } from "@mercabana/db";

export type AppEnv = {
  Bindings: {
    DB: D1Database;
    SESSIONS: KVNamespace;
  };
  Variables: {
    tenant: Tenant;
    user: User | null;
    sessionToken: string | null;
  };
};
