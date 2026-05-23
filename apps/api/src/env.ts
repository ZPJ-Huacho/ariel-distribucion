import type { Tenant } from "@mercabana/db";

export type AppEnv = {
  Bindings: {
    DB: D1Database;
    SESSIONS: KVNamespace;
  };
  Variables: {
    tenant: Tenant;
  };
};
