import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./env";
import { resolveTenant } from "./middleware/tenant";
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
  }),
);

app.get("/", (c) => c.text("mercabana-api"));

app.use("/api/*", resolveTenant);
app.route("/api", publicRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "internal_error", message: err.message }, 500);
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

export default app;
