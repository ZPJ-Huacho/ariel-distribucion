import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
};

export const settings = pgTable(
  "settings",
  {
    id: integer("id").primaryKey().default(1),
    businessName: text("business_name").notNull().default("Mi negocio"),
    tagline: text("tagline").notNull().default(""),
    heroPhrase: text("hero_phrase").notNull().default(""),
    logoUrl: text("logo_url").notNull().default(""),
    logoKey: text("logo_key").notNull().default(""),
    whatsappNumber: text("whatsapp_number").notNull().default(""),
    address: text("address").notNull().default(""),
    schedule: jsonb("schedule").$type<WeekScheduleRow>().default({
      mon: { closed: false, open: "09:00", close: "18:00" },
      tue: { closed: false, open: "09:00", close: "18:00" },
      wed: { closed: false, open: "09:00", close: "18:00" },
      thu: { closed: false, open: "09:00", close: "18:00" },
      fri: { closed: false, open: "09:00", close: "18:00" },
      sat: { closed: false, open: "10:00", close: "14:00" },
      sun: { closed: true, open: "00:00", close: "00:00" },
    }),
    social: jsonb("social").$type<SocialLinksRow>().default({
      instagram: "",
      facebook: "",
      tiktok: "",
      youtube: "",
      twitter: "",
    }),
    theme: text("theme").notNull().default("default"),
    aiEnabled: boolean("ai_enabled").notNull().default(false),
    aiImagesUsedToday: integer("ai_images_used_today").notNull().default(0),
    aiUsageResetAt: text("ai_usage_reset_at").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // single-row enforcement
    uniqueIndex("settings_singleton").on(t.id),
  ],
);

type DayHoursRow = { closed: boolean; open: string; close: string };
type WeekScheduleRow = {
  mon: DayHoursRow;
  tue: DayHoursRow;
  wed: DayHoursRow;
  thu: DayHoursRow;
  fri: DayHoursRow;
  sat: DayHoursRow;
  sun: DayHoursRow;
};
type SocialLinksRow = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    address: text("address"),
    preferredDeliveryTime: text("preferred_delivery_time"),
    role: text("role", { enum: ["admin", "customer"] }).notNull().default("customer"),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    lead: text("lead").notNull().default(""),
    icon: text("icon").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("categories_slug_unique").on(t.slug),
    index("categories_sort_idx").on(t.sortOrder),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: doublePrecision("price").notNull(),
    unit: text("unit").notNull(),
    emoji: text("emoji").notNull().default(""),
    gradient: text("gradient").notNull().default(""),
    imageKey: text("image_key"),
    available: boolean("available").notNull().default(true),
    highlighted: boolean("highlighted").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_sort_idx").on(t.sortOrder),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    code: text("code").notNull(),
    status: text("status", {
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
    })
      .notNull()
      .default("pending"),
    source: text("source").notNull().default("direct"),
    total: doublePrecision("total").notNull(),
    items: jsonb("items").notNull().$type<OrderItem[]>(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerAddress: text("customer_address"),
    preferredTime: text("preferred_time"),
    notes: text("notes"),
    ...timestamps,
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_code_unique").on(t.code),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export type OrderItem = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
