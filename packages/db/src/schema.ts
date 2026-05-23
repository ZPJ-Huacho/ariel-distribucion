import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const tenants = sqliteTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    whatsappNumber: text("whatsapp_number").notNull().default(""),
    address: text("address").notNull().default(""),
    deliveryHours: text("delivery_hours").notNull().default(""),
    primaryColor: text("primary_color").notNull().default("#2d5128"),
    primaryColorDark: text("primary_color_dark").notNull().default("#1f3b1c"),
    emoji: text("emoji").notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("tenants_slug_unique").on(t.slug)],
);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    role: text("role", { enum: ["admin", "customer"] }).notNull().default("customer"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("users_tenant_email_unique").on(t.tenantId, t.email),
    index("users_tenant_idx").on(t.tenantId),
  ],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    lead: text("lead").notNull().default(""),
    icon: text("icon").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("categories_tenant_slug_unique").on(t.tenantId, t.slug),
    index("categories_tenant_sort_idx").on(t.tenantId, t.sortOrder),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: real("price").notNull(),
    unit: text("unit").notNull(),
    emoji: text("emoji").notNull().default(""),
    gradient: text("gradient").notNull().default(""),
    imageR2Key: text("image_r2_key"),
    available: integer("available", { mode: "boolean" }).notNull().default(true),
    highlighted: integer("highlighted", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_tenant_idx").on(t.tenantId),
    index("products_tenant_category_idx").on(t.tenantId, t.categoryId),
    index("products_tenant_sort_idx").on(t.tenantId, t.sortOrder),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    code: text("code").notNull(),
    status: text("status", {
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
    })
      .notNull()
      .default("pending"),
    source: text("source").notNull().default("direct"),
    total: real("total").notNull(),
    items: text("items", { mode: "json" }).notNull().$type<OrderItem[]>(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerAddress: text("customer_address"),
    preferredTime: text("preferred_time"),
    notes: text("notes"),
    ...timestamps,
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    uniqueIndex("orders_tenant_code_unique").on(t.tenantId, t.code),
    index("orders_tenant_status_idx").on(t.tenantId, t.status),
    index("orders_tenant_created_idx").on(t.tenantId, t.createdAt),
  ],
);

export type OrderItem = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
