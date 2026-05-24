import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./env";
import { resolveSession, requireAdmin } from "./middleware/auth";
import { resolveTenant } from "./middleware/tenant";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { orderRoutes } from "./routes/orders";
import { publicRoutes } from "./routes/public";

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return origin;
      if (origin.endsWith(".localhost:3000") || origin === "http://localhost:3000") return origin;
      if (origin.endsWith(".mercabana.com")) return origin;
      return null;
    },
    credentials: true,
    allowHeaders: ["content-type", "x-tenant-slug"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/", (c) => c.text("mercabana-api"));

app.use("/api/*", resolveTenant);
app.use("/api/*", resolveSession);

app.route("/api", publicRoutes);
app.route("/api/auth", authRoutes);
app.route("/api/orders", orderRoutes);

app.use("/api/admin/*", requireAdmin);
app.route("/api/admin", adminRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "internal_error", message: err.message }, 500);
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

export default app;
